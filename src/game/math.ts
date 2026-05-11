export type vec2 = [number, number];
export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];

export interface IVec2 {
  x: number;
  y: number;
}

export function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomHexColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

export function circleSquare(radius: number) {
  return Math.PI * radius * radius;
}

export function distanceSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.hypot(dx, dy)
}

export const PI_MUL_2 = 2 * Math.PI;
export const PI_DIV_2 = Math.PI / 2;
export const PI_DIV_4 = Math.PI / 4;
