import { TelemetryFrame } from "./datalogger";

export interface FlappyMetrics {
  maxExtension: number; // Lowest fistStrength (closer to 0 is flat open hand)
  maxFlexion: number;   // Highest fistStrength (closer to 1+ is tightly closed fist)
  activationCount: number; // Intentional closures (crossings of threshold)
  fatigueIndex: number; // Diff in peak flexion (last 25% vs first 25% of the game)
  smoothnessJerk: number; // Derivative of acceleration of fistStrength
}

export interface WaterMetrics {
  maxSupination: number; // Max tilt left (positive)
  maxPronation: number;  // Max tilt right (negative)
  smoothnessJerk: number; // Jerk of pitcherRotationZ
  waterAccuracy: number; // Average percentage of target volume reached
  poisonError: number; // Total poison volume spilled into the glass
  averagePouringTime: number; // Average ms spent in pouring phase per round
}

export interface SlingshotMetrics {
  maxPinchOpen: number; // Max pinchRatio (open fingers)
  maxPullDistance: number; // Euclidean distance from anchor
  pullTremor: number; // Jerk of XY while pinched
  accuracyRatio: number; // Targets hit / Birds fired
}

export class BiomechanicsDSP {
  
  static processFlappyMetrics(frames: TelemetryFrame[]): FlappyMetrics {
    // Only analyze frames when the game is actually playing
    const activeFrames = frames.filter(f => f.phase === "playing" && f.fistStrength !== undefined);
    
    if (activeFrames.length < 10) {
      return {
        maxExtension: 0,
        maxFlexion: 0,
        activationCount: 0,
        fatigueIndex: 0,
        smoothnessJerk: 0
      };
    }

    const strengths = activeFrames.map(f => f.fistStrength!);
    
    // 1. ROM: Extension (Min Strength) and Flexion (Max Strength)
    const maxExtension = Math.min(...strengths);
    const maxFlexion = Math.max(...strengths);

    // 2. Activation Count (crossings of 0.5 threshold)
    let activationCount = 0;
    let isSqueezing = false;
    for (const s of strengths) {
      if (s > 0.5 && !isSqueezing) {
        activationCount++;
        isSqueezing = true;
      } else if (s < 0.4) {
        isSqueezing = false;
      }
    }

    // 3. Fatigue Index
    // Split into first 25% of game and last 25%
    const quarter = Math.max(1, Math.floor(strengths.length / 4));
    const firstQuarter = strengths.slice(0, quarter);
    const lastQuarter = strengths.slice(-quarter);
    
    const peakFirstQuarter = Math.max(...firstQuarter);
    const peakLastQuarter = Math.max(...lastQuarter);
    
    // Negative value indicates they got weaker
    const fatigueIndex = peakLastQuarter - peakFirstQuarter;

    // 4. Smoothness (velocity irregularity index)
    // Measures how erratic the speed changes are. Smooth movement has consistent
    // velocity profile; spastic movement has sudden speed spikes.
    // Smooth fistStrength with 5-frame moving average to remove camera noise
    const WINDOW = 5;
    const smoothedStrengths: number[] = [];
    for (let i = 0; i < strengths.length; i++) {
      const start = Math.max(0, i - Math.floor(WINDOW / 2));
      const end = Math.min(strengths.length, i + Math.floor(WINDOW / 2) + 1);
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += strengths[j];
      }
      smoothedStrengths.push(sum / (end - start));
    }

    // Compute frame-to-frame speed (absolute velocity)
    const speeds: number[] = [];
    for (let i = 1; i < smoothedStrengths.length; i++) {
      const dt = (activeFrames[i].timestamp - activeFrames[i-1].timestamp) / 1000;
      if (dt > 0.001) {
        speeds.push(Math.abs(smoothedStrengths[i] - smoothedStrengths[i-1]) / dt);
      }
    }

    let smoothnessJerk = 0;
    if (speeds.length > 2) {
      const meanSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      if (meanSpeed > 0.01) {
        const variance = speeds.reduce((a, s) => a + (s - meanSpeed) ** 2, 0) / speeds.length;
        // Coefficient of variation of speed: 0-2 smooth, 2-5 normal, >5 spastic
        smoothnessJerk = Math.sqrt(variance) / meanSpeed;
      }
    }

    return {
      maxExtension,
      maxFlexion,
      activationCount,
      fatigueIndex,
      smoothnessJerk
    };
  }

  static processWaterMetrics(frames: TelemetryFrame[]): WaterMetrics {
    const activeFrames = frames.filter(f => f.pitcherRotationZ !== undefined);
    
    if (activeFrames.length < 10) {
      return {
        maxSupination: 0,
        maxPronation: 0,
        smoothnessJerk: 0,
        waterAccuracy: 0,
        poisonError: 0,
        averagePouringTime: 0
      };
    }

    const rotations = activeFrames.map(f => f.pitcherRotationZ!);
    
    // 1. ROM: Max Supination (positive tilt) and Max Pronation (negative tilt)
    const maxSupination = Math.max(...rotations);
    const maxPronation = Math.min(...rotations);

    // 2. Smoothness (velocity irregularity of rotation during pouring)
    const pouringFrames = activeFrames.filter(f => f.phase === "pouring");

    // Smooth rotation signal with 5-frame moving average to remove camera noise
    const WINDOW = 5;
    const smoothedRotations: number[] = [];
    for (let i = 0; i < pouringFrames.length; i++) {
      const start = Math.max(0, i - Math.floor(WINDOW / 2));
      const end = Math.min(pouringFrames.length, i + Math.floor(WINDOW / 2) + 1);
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += pouringFrames[j].pitcherRotationZ!;
      }
      smoothedRotations.push(sum / (end - start));
    }

    // Compute frame-to-frame angular speed
    const angularSpeeds: number[] = [];
    for (let i = 1; i < smoothedRotations.length; i++) {
      const dt = (pouringFrames[i].timestamp - pouringFrames[i-1].timestamp) / 1000;
      if (dt > 0.001) {
        angularSpeeds.push(Math.abs(smoothedRotations[i] - smoothedRotations[i-1]) / dt);
      }
    }

    let smoothnessJerk = 0;
    if (angularSpeeds.length > 2) {
      const meanSpeed = angularSpeeds.reduce((a, b) => a + b, 0) / angularSpeeds.length;
      if (meanSpeed > 0.01) {
        const variance = angularSpeeds.reduce((a, s) => a + (s - meanSpeed) ** 2, 0) / angularSpeeds.length;
        smoothnessJerk = Math.sqrt(variance) / meanSpeed;
      }
    }

    // 3. Accuracy & Error
    let totalWaterAccuracy = 0;
    let totalPoisonError = 0;
    const rounds = new Set(activeFrames.map(f => f.round).filter(r => r !== undefined));
    let totalPouringTime = 0;

    rounds.forEach(roundNum => {
      // Get frames for this specific round
      const roundFrames = activeFrames.filter(f => f.round === roundNum);
      if (roundFrames.length === 0) return;

      // Accuracy: Look at the very last frame of this round to see final volumes
      const lastFrame = roundFrames[roundFrames.length - 1];
      const target = lastFrame.glassTargetVolume || 1;
      const current = lastFrame.glassCurrentVolume || 0;
      const poison = lastFrame.glassPoisonVolume || 0;

      // Accuracy is percentage filled, capped at 100%
      const accuracy = Math.min(1.0, current / target);
      totalWaterAccuracy += accuracy;
      totalPoisonError += poison;

      // Pouring time for this round
      const roundPouringFrames = roundFrames.filter(f => f.phase === "pouring");
      if (roundPouringFrames.length > 1) {
        const pTime = roundPouringFrames[roundPouringFrames.length - 1].timestamp - roundPouringFrames[0].timestamp;
        totalPouringTime += pTime;
      }
    });

    const numRounds = rounds.size || 1;
    
    return {
      maxSupination,
      maxPronation,
      smoothnessJerk,
      waterAccuracy: totalWaterAccuracy / numRounds,
      poisonError: totalPoisonError,
      averagePouringTime: totalPouringTime / numRounds
    };
  }

  static processSlingshotMetrics(frames: TelemetryFrame[]): SlingshotMetrics {
    const activeFrames = frames.filter(f => f.pinchRatio !== undefined);
    
    if (activeFrames.length < 10) {
      return { maxPinchOpen: 0, maxPullDistance: 0, pullTremor: 0, accuracyRatio: 0 };
    }

    // 1. Pinch ROM
    const maxPinchOpen = Math.max(...activeFrames.map(f => f.pinchRatio!));

    // 2. Max Pull Distance
    const ANCHOR_X = 450;
    const ANCHOR_Y = 520;
    
    let maxPullDistance = 0;
    const pinchedFrames = activeFrames.filter(f => f.isPinching && f.pullX !== undefined && f.pullY !== undefined);
    
    pinchedFrames.forEach(f => {
      const dist = Math.hypot(f.pullX! - ANCHOR_X, f.pullY! - ANCHOR_Y);
      if (dist > maxPullDistance) maxPullDistance = dist;
    });

    // 3. Pull Tremor (Stability while aiming — velocity irregularity of XY)
    // Smooth pull positions with 5-frame moving average
    const W = 5;
    const smoothedX: number[] = [];
    const smoothedY: number[] = [];
    for (let i = 0; i < pinchedFrames.length; i++) {
      const start = Math.max(0, i - Math.floor(W / 2));
      const end = Math.min(pinchedFrames.length, i + Math.floor(W / 2) + 1);
      let sx = 0, sy = 0;
      for (let j = start; j < end; j++) {
        sx += pinchedFrames[j].pullX!;
        sy += pinchedFrames[j].pullY!;
      }
      smoothedX.push(sx / (end - start));
      smoothedY.push(sy / (end - start));
    }

    // Compute frame-to-frame 2D speed
    const pullSpeeds: number[] = [];
    for (let i = 1; i < smoothedX.length; i++) {
      const dt = (pinchedFrames[i].timestamp - pinchedFrames[i-1].timestamp) / 1000;
      if (dt > 0.001) {
        const speed = Math.hypot(smoothedX[i] - smoothedX[i-1], smoothedY[i] - smoothedY[i-1]) / dt;
        pullSpeeds.push(speed);
      }
    }

    let pullTremor = 0;
    if (pullSpeeds.length > 2) {
      const meanSpeed = pullSpeeds.reduce((a, b) => a + b, 0) / pullSpeeds.length;
      if (meanSpeed > 0.1) {
        const variance = pullSpeeds.reduce((a, s) => a + (s - meanSpeed) ** 2, 0) / pullSpeeds.length;
        pullTremor = Math.sqrt(variance) / meanSpeed;
      }
    }

    // 4. Accuracy
    const lastFrame = activeFrames[activeFrames.length - 1];
    const score = lastFrame.score || 0;
    const birdsLeft = lastFrame.birdsLeft === undefined ? 5 : lastFrame.birdsLeft;
    const fired = 5 - birdsLeft;
    
    const accuracyRatio = fired > 0 ? Math.min(1.0, score / fired) : 0;

    return {
      maxPinchOpen,
      maxPullDistance,
      pullTremor,
      accuracyRatio
    };
  }
}
