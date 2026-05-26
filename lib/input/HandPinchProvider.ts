import { visionSession } from '@/lib/vision-session';
import type { InputProvider, InputEvent } from './types';

const WORLD_W = 1280;
const WORLD_H = 720;

const SLINGSHOT_ANCHOR = { x: 450, y: 520 };

const DRAG_SCALE = 0.7;

const PINCH_START_RATIO = 0.25;
const PINCH_END_RATIO   = 0.40;

export class HandPinchProvider implements InputProvider {
  private unsubVision: (() => void) | null = null;
  private subscribers = new Set<(e: InputEvent) => void>();

  private isPinching = false;
  private pinchStartX = 0;
  private pinchStartY = 0;

  private readyResolve: (() => void) | null = null;
  readonly ready: Promise<void>;

  constructor() {
    this.ready = new Promise<void>(resolve => { this.readyResolve = resolve; });
  }

  async start(_canvas: HTMLCanvasElement): Promise<void> {
    await visionSession.start();

    this.unsubVision = visionSession.subscribe((frame) => {
      if (frame && frame.landmarks.length >= 10) {
        this.processPinch(frame.landmarks);
      } else if (this.isPinching) {
        this.isPinching = false;
        this.emit('up', SLINGSHOT_ANCHOR.x, SLINGSHOT_ANCHOR.y);
      }
    });

    this.readyResolve?.();
  }

  stop(): void {
    this.unsubVision?.();
    this.unsubVision = null;
    if (this.isPinching) {
      this.isPinching = false;
      this.emit('up', SLINGSHOT_ANCHOR.x, SLINGSHOT_ANCHOR.y);
    }
  }

  subscribe(cb: (e: InputEvent) => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private processPinch(lm: { x: number; y: number; z: number }[]) {
    const thumb = lm[4];
    const index = lm[8];
    const wrist = lm[0];
    const middleBase = lm[9];

    // Scale-invariant pinch ratio
    const handSize  = Math.hypot(wrist.x - middleBase.x, wrist.y - middleBase.y);
    const pinchDist = Math.hypot(thumb.x - index.x, thumb.y - index.y);
    const ratio = handSize > 0.001 ? pinchDist / handSize : 1;

    // Midpoint between thumb and index in normalized camera space
    const midX = (thumb.x + index.x) / 2;
    const midY = (thumb.y + index.y) / 2;

    const wasPinching = this.isPinching;

    if (!this.isPinching && ratio < PINCH_START_RATIO) {
      this.isPinching = true;
      this.pinchStartX = midX;
      this.pinchStartY = midY;
    } else if (this.isPinching && ratio > PINCH_END_RATIO) {
      this.isPinching = false;
    }

    if (!wasPinching && this.isPinching) {
      // Pinch started → always grab the bird regardless of hand position
      this.emit('down', SLINGSHOT_ANCHOR.x, SLINGSHOT_ANCHOR.y, ratio);
    } else if (wasPinching && !this.isPinching) {
      // Pinch ended → release at current drag position
      const { wx, wy } = this.dragPos(midX, midY);
      this.emit('up', wx, wy, ratio);
    } else if (this.isPinching) {
      // Still pinching → drag relative to where pinch started
      const { wx, wy } = this.dragPos(midX, midY);
      this.emit('move', wx, wy, ratio);
    } else {
      // Not pinching → hover to track continuous ratio
      this.emit('hover', SLINGSHOT_ANCHOR.x, SLINGSHOT_ANCHOR.y, ratio);
    }
  }

  // Map camera delta from pinch-start to world coords relative to SLINGSHOT_ANCHOR.
  // Camera X is mirrored so the gesture feels natural (pull left = bird goes left).
  private dragPos(midX: number, midY: number): { wx: number; wy: number } {
    const dx = -(midX - this.pinchStartX) * WORLD_W * DRAG_SCALE;
    const dy =  (midY - this.pinchStartY) * WORLD_H * DRAG_SCALE;
    return {
      wx: SLINGSHOT_ANCHOR.x + dx,
      wy: SLINGSHOT_ANCHOR.y + dy,
    };
  }

  private emit(type: 'down' | 'move' | 'up' | 'hover', x: number, y: number, pinchRatio?: number) {
    const event: InputEvent = { type, x, y, timestamp: performance.now(), pinchRatio };
    this.subscribers.forEach(cb => cb(event));
  }
}
