import { hasValue } from 'common/monads';

interface RectLike { x: number; y: number; width: number; height: number };

function isRectLike(obj: any): obj is RectLike {
  return hasValue(obj) && hasValue(obj.x) && hasValue(obj.y) &&
    hasValue(obj.width) && hasValue(obj.height);
}

export { RectLike, isRectLike };
export default RectLike;