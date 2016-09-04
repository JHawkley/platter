import Rect from '../math/rect';
import { hasValue } from 'common/monads';

interface Rectable { toRect: (out: Rect) => Rect };

function isRectable(obj: any): obj is Rectable {
  return hasValue(obj) && typeof obj.toRect === 'function';
}

export { isRectable, Rectable };
export default Rectable;