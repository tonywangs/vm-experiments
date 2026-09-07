import { expect, test } from 'vitest';
import { clickToPoint, pointStyle, sourceToPoint } from '../client/geometry';

test('represents the source image center consistently at intrinsic size', () => {
  const point = clickToPoint(700, 450, { left: 100, top: 50, width: 1200, height: 800 }, 1200, 800);
  expect(point).toEqual({ x: 0.5, y: 0.5 });
  expect(pointStyle(point)).toEqual({ left: '50%', top: '50%' });
  expect(sourceToPoint(600, 400, 1200, 800)).toEqual(point);
});
