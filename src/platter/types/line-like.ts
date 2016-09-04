import { VectorLike, isVectorLike } from './vector-like';
import { hasValue } from 'common/monads';

interface LineLike { point1: VectorLike; point2: VectorLike; };

function isLineLike(obj: any): obj is LineLike {
  return hasValue(obj) && isVectorLike(obj.point1) && isVectorLike(obj.point2);
}

export { LineLike, isLineLike };
export default LineLike;