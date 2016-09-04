import VectorLike from '../types/vector-like';
import lerp from '../utils/lerp';
import { BaseVector, MutableVector, ImmutableVector } from './vector';
import { set, setXY } from './vector-math';
import { hasValue } from 'common/monads';

let zeroVector = ImmutableVector.create(0, 0);
let workingVector = MutableVector.create(0, 0);

function map<T extends VectorLike>(out: T, nStart: number, nStop: number, vMin: VectorLike, vMax: VectorLike, n: number): T {
  let s = ((n - nStart) / (nStop - nStart));
  return setXY(out, lerp(vMin.x, vMax.x, s), lerp(vMin.y, vMax.y, s));
}

const pool: Array<InterpolationNode> = [];

class InterpolationNode {

  pos: number;
  value: BaseVector;

  static create(pos: number, value: VectorLike): InterpolationNode {
    let instance = pool.pop() || new InterpolationNode();
    return InterpolationNode.init(instance, pos, value);
  }

  static reclaim(instance: InterpolationNode) {
    instance.value.release();
    instance.value = null as any;
    pool.push(instance);
  }

  static init(instance: InterpolationNode, pos: number, value: VectorLike) {
    if (pos < 0 || pos > 1) throw new Error('out of range');
    if (!hasValue(value)) throw new Error('null reference');
    instance.pos = pos;
    instance.value = MutableVector.create(value.x, value.y);
    return instance;
  }

  static comparer(a: InterpolationNode, b: InterpolationNode): number {
    return a.pos - b.pos;
  }

  constructor() {
    this.pos = 0.0;
    this.value = zeroVector;
  }

  release() { InterpolationNode.reclaim(this); }
}

class VectorInterpolation {

  /**
   * The list of values makign up the vector interpolation.
   * 
   * @private
   * @type {Array<InterpolationNode>}
   */
  private _nodes: Array<InterpolationNode>;

  /**
   * Creates an instance of `VectorInterpolation`.
   */
  constructor() { this._nodes = []; }

  /**
   * Gets the interpolated vector at `pos` and copies it to `out`.
   * 
   * @template T
   * @param {T} out The vector to copy the value to.
   * @param {number} pos The position to get the interpolated value from.
   * @returns {T}
   */
  valueAt<T extends VectorLike>(out: T, pos: number): T {
    let nodes = this._nodes;
    if (nodes.length === 0)
      set(out, zeroVector);
    else if (pos <= 0) {
      let node = nodes[0];
      set(out, node.pos === 0.0 ? node.value : zeroVector);
    } else {
      let node = nodes[nodes.length - 1];
      if (pos >= 1.0 || pos >= node.pos)
        set(out, node.value);
      else {
        let lPos = 0.0, lValue = zeroVector;

        for (let i = 0, len = nodes.length; i < len; i++) {
          let { pos: cPos, value: cValue } = nodes[i];
          // Prevent division by 0.
          if (cPos === lPos) {
            if (pos === cPos) {
              set(out, cValue);
              break;
            }
          } else if (lPos < pos && pos <= cPos) {
            map(out, lPos, cPos, lValue, cValue, pos);
            break;
          }
          lPos = cPos;
          lValue = cValue;
        }
      }
    }
    return out;
  }

  /**
   * Adds `value` to the position specified by `pos`.  If no position is
   * given, defaults to `1.0`.
   * 
   * @param {VectorLike} value The value to add.
   * @param {number} [pos=1.0] The position to add the value.
   * @returns {this}
   */
  add(value: VectorLike, pos = 1.0): this {
    let nodes = this._nodes;
    nodes.push(InterpolationNode.create(pos, value));
    nodes.sort(InterpolationNode.comparer);
    return this;
  }

  /**
   * Resets the `VectorInterpolation` instance, setting position `1.0` to
   * that of `value`.
   * 
   * @param {VectorLike} value The value for position `1.0`.
   * @returns {this}
   */
  set(value: VectorLike): this {
    if (this._nodes.length > 0) this.clear();
    this.add(value, 1.0);
    return this;
  }

  /**
   * Sets 1.0 to `value` while maintaining the value at `pos` such that
   * `valueAt(pos)` will return the same value after this function is called.
   * Values at other positions may have changed, though.
   * 
   * NOTE: This method will result in the instance having only two nodes,
   * the vector given as `value` and the new vector created at `pos`.
   * Any other nodes will be removed.
   * 
   * @param {number} pos The position whose value should not change.
   * @param {VectorLike} value The new value for position `1.0`.
   * @returns {this}
   */
  divert(pos: number, value: VectorLike): this {
    if (pos >= 1.0)
      return this.set(value);
    this.valueAt(workingVector, pos);
    this.set(value);
    this.add(workingVector, pos);
    return this;
  }

  /**
   * Clears all nodes from the `VectorInterpolation` instance.
   * 
   * @returns {this}
   */
  clear(): this {
    let nodes = this._nodes;
    for (let i = 0, len = nodes.length; i < len; i++)
      nodes[i].release();
    nodes.length = 0;
    return this;
  }
}

export default VectorInterpolation;