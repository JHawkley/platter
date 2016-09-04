import { hasValue } from 'common/monads';

interface VectorLike { x: number, y: number };

function isVectorLike(obj: any): obj is VectorLike {
  return hasValue(obj) && hasValue(obj.x) && hasValue(obj.y);
}

export { VectorLike, isVectorLike };
export default VectorLike;