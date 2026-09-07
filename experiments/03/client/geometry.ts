import type { Point } from './types';

export interface ImageBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function clickToPoint(clientX: number, clientY: number, bounds: ImageBounds, sourceWidth: number, sourceHeight: number): Point {
  return {
    x: (clientX - bounds.left) / sourceWidth,
    y: (clientY - bounds.top) / sourceHeight,
  };
}

export function sourceToPoint(sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number): Point {
  return { x: sourceX / sourceWidth, y: sourceY / sourceHeight };
}

export function pointStyle(point: Point): { left: string; top: string } {
  return { left: `${point.x * 100}%`, top: `${point.y * 100}%` };
}
