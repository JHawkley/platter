import { hasValue } from 'common/monads';

interface CircleLike { x: number; y: number; radius: number; };

function isCircleLike(obj: any): obj is CircleLike {
  return hasValue(obj) && hasValue(obj.x) && hasValue(obj.y) &&
    hasValue(obj.radius);
}

export { CircleLike, isCircleLike };
export default CircleLike;