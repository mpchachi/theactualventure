import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

export type LandmarkFrame = {
  landmarks: { x: number; y: number; z: number }[];
  timestamp: number;
};

type Subscriber = (frame: LandmarkFrame | null) => void;

class VisionSession {
  private landmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private subscribers = new Set<Subscriber>();
  private lastVideoTime = -1;
  private state: "idle" | "starting" | "running" | "error" = "idle";
  private initPromise: Promise<void> | null = null;

  async start(): Promise<void> {
    if (this.state === "running") return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init(): Promise<void> {
    this.state = "starting";
    try {
      const vision = await FilesetResolver.forVisionTasks("/wasm");

      const orig = console.error;
      console.error = (...args: unknown[]) => {
        if (typeof args[0] === "string" && args[0].startsWith("INFO:")) return;
        orig.apply(console, args);
      };
      try {
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.4,
          minHandPresenceConfidence: 0.4,
          minTrackingConfidence: 0.4,
        });
      } finally {
        console.error = orig;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = this.stream;
      video.playsInline = true;
      video.muted = true;
      video.setAttribute("autoplay", "");
      video.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;";
      document.body.appendChild(video);
      this.video = video;

      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
        video.play();
      });

      this.state = "running";
      this.loop();
    } catch (e) {
      this.state = "error";
      this.initPromise = null;
      throw e;
    }
  }

  private loop = () => {
    if (this.state !== "running" || !this.video || !this.landmarker) return;

    const now = performance.now();
    if (this.video.currentTime !== this.lastVideoTime && this.video.readyState >= 2) {
      this.lastVideoTime = this.video.currentTime;
      const results = this.landmarker.detectForVideo(this.video, now);

      if (results.landmarks && results.landmarks.length > 0) {
        const frame: LandmarkFrame = {
          landmarks: results.landmarks[0] as { x: number; y: number; z: number }[],
          timestamp: now,
        };
        this.subscribers.forEach((cb) => cb(frame));
      } else {
        this.subscribers.forEach((cb) => cb(null));
      }
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  subscribe(cb: Subscriber): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.video) {
      this.video.srcObject = null;
      this.video.remove();
      this.video = null;
    }
    this.landmarker = null;
    this.state = "idle";
    this.initPromise = null;
    this.lastVideoTime = -1;
  }

  isRunning() {
    return this.state === "running";
  }
}

export const visionSession = new VisionSession();
