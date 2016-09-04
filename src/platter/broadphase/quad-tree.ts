import Rect from '../math/rect';
import RectLike from '../types/rect-like';
import { removeAtFast as removeAt } from '../utils/array';
import { Rectable, isRectable } from '../types/rectable';
import { Maybe, hasValue, getOrElse } from 'common/monads';

type BoundedObject = RectLike | Rectable;
type Nodes<T extends BoundedObject> = { [quad: number]: QuadTree<T> };

let workingRect = Rect.create();

enum Quads {
  none = 0,
  topLt = (1 << 0),
  topRt = (1 << 1),
  botLt = (1 << 2),
  botRt = (1 << 3)
}

let pool: Array<QuadTree<any>> = [];

class QuadTree<T extends BoundedObject> {

  /**
   * The maximum number of objects the quad-tree may contain before it must
   * be broken into quadrants.
   * 
   * @type {number}
   */
  maxObjects: number;
  
  /**
   * The maximum depth of the quad-tree.
   * 
   * @type {number}
   */
  maxLevels: number;
  
  /**
   * The depth of the quad-tree.
   * 
   * @type {number}
   */
  level: number;
  
  /**
   * An array of the objects currently on this level of the quad-tree.
   * 
   * @type {Array<T>}
   */
  objects: Array<T>;
  
  /**
   * The sub-quadrants of the quad-tree.
   * 
   * @type {Maybe<Nodes<T>>}
   */
  nodes: Maybe<Nodes<T>>;
  
  /**
   * The bounds of this quad-tree.
   * 
   * @type {Rect}
   */
  bounds: Rect;

  static FLAGS = Quads;

  static create<T extends BoundedObject>(x: number, y: number, w: number, h: number, maxObjects: number, maxLevels: number, level?: number): QuadTree<T> {
    let instance = pool.pop() || new QuadTree<T>();
    return QuadTree.init(instance, x, y, w, h, maxObjects, maxLevels, level);
  }

  static reclaim(instance: QuadTree<any>) { pool.push(instance); }

  static init<T extends BoundedObject>(instance: QuadTree<T>, bounds: RectLike, maxObjects?: number, maxLevels?: number, level?: number): QuadTree<T>;
  static init<T extends BoundedObject>(instance: QuadTree<T>, x: number, y: number, w: number, h: number, maxObjects?: number, maxLevels?: number, level?: number): QuadTree<T>;
  static init<T extends BoundedObject>(instance: QuadTree<T>, x: number | RectLike, y: number, w: number, h: number, maxObjects?: number, maxLevels?: number, level?: number) {
    if (typeof x !== 'number') {
      maxObjects = y;
      maxLevels = w;
      level = h;
      let bounds = x;
      ({ x, y, width: w, height: h } = bounds);
    }

    instance.maxObjects = getOrElse(maxObjects, 10);
    instance.maxLevels = getOrElse(maxLevels, 4);
    instance.level = getOrElse(level, 0);
    instance.bounds.setProps(x, y, w, h);
    return instance;
  }

  /**
   * Creates an instance of `QuadTree`.
   */
  constructor() {
    this.objects = [];
    this.nodes = null;
    this.bounds = Rect.create();
  }

  /**
   * Inserts the given object into the quad-tree.
   * 
   * @param {T} object The object to insert into the quad-tree.
   */
  insert(object: T) {
    if (hasValue(this.nodes)) {
      let quads = this._getQuads(object);
      if (!!Quads[quads]) {
        this.nodes[quads].insert(object);
        return;
      }
      this.objects.push(object);
    } else {
      this.objects.push(object);

      if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
        let nodes = this._split(), i = 0;
        while (i < this.objects.length) {
          let obj = this.objects[i];
          let quads = this._getQuads(obj);
          if (!!Quads[quads]) {
            removeAt(this.objects, i);
            nodes[quads].insert(obj);
          }
          else { i += 1; }
        }
      }
    }
  }

  /**
   * Retrieves an array of all objects the given object may overlap.
   * 
   * @param {BoundedObject} object The object to use to test for potential overlap.
   * @returns {Array<T>}
   */
  retrieve(object: BoundedObject): Array<T> {
    let arrs: Array<any> = [this.objects];

    if (hasValue(this.nodes)) {
      let quads = this._getQuads(object);
      for (let q in this.nodes) {
        if ((quads & Number(q)) === 0) continue;
        arrs.push(this.nodes[q].retrieve(object))
      }
    }
    let ref = Array.prototype.concat;
    return ref.call.apply(ref, arrs);
  }

  /**
   * Returns the quad-tree to the object pool.
   */
  release() {
    this.clear();
    QuadTree.reclaim(this);
  }

  /**
   * Clears the quad-tree and resets it to use the provided bounds.
   * 
   * @param {Bounds} bounds The bounds to reset the quad-tree to.
   */
  reset(bounds: RectLike) {
    this.clear();
    this.bounds.set(bounds);
  }

  /**
   * Clears the quad-tree of all objects.
   */
  clear() {
    this.objects = [];
    if (hasValue(this.nodes))
      for (let q in this.nodes)
        this.nodes[q].release();
    this.nodes = null;
  }

  /**
   * Creates a string representation of the quad-tree, including all
   * sub-trees and their objects.
   * 
   * @returns {string}
   */
  toString(): string {
    let str: string;
    let indent = (new Array(this.level + 1)).join('  ');
    let parts: Array<string> = [];
    parts.push(`Quad-Tree (level ${this.level})`);
    parts.push('-Objects-');
    if (this.objects.length > 0)
      for (let i = 0, len = this.objects.length; i < len; i++)
        parts.push(this.objects[i].toString());
    else
      parts.push('(empty)');
    parts.push('');
    parts.push('--Nodes--');
    if (hasValue(this.nodes)) {
      str = parts.map((part) => indent + part).join('\r\n');
      for (let quad in this.nodes) {
        let node = this.nodes[quad];
        str += '\r\n';
        switch (Number(quad)) {
          case Quads.topLt: str += indent + '@ top-left\r\n'; break;
          case Quads.topRt: str += indent + '@ top-right\r\n'; break;
          case Quads.botLt: str += indent + '@ bottom-left\r\n'; break;
          case Quads.botRt: str += indent + '@ bottom-right\r\n'; break;
        }
        str += node.toString();
      }
    } else {
      parts.push('(empty)');
      parts.push('');
      str = parts.map((part) => indent + part).join('\r\n');
    }
    return str;
  }

  /**
   * Gets a set of flags indicating which child nodes can contain the object.
   * 
   * @private
   * @param {BoundedObject} object The object to use to test for containment.
   * @returns {Quads}
   */
  private _getQuads(object: BoundedObject): Quads {
    let rect: RectLike = isRectable(object) ? object.toRect(workingRect) : object;
    let quads = Quads.none;
    let vm = this.bounds.x + (this.bounds.width / 2);
    let hm = this.bounds.y + (this.bounds.height / 2);
    let { x, y, width, height } = rect;

    let leftQuadrant = x <= vm;
    let rightQuadrant = x + width >= vm;

    if (y <= hm) {
      if (leftQuadrant) quads |= Quads.topLt;
      if (rightQuadrant) quads |= Quads.topRt;
    }
    if (y + height >= hm) {
      if (leftQuadrant) quads |= Quads.botLt;
      if (rightQuadrant) quads |= Quads.botRt;
    }
    return quads;
  }

  /**
   * Splits the quad-tree into four child nodes, one for each quadrant.
   * 
   * @private
   * @returns {Nodes<T>}
   */
  private _split(): Nodes<T> {
    let lev = this.level + 1, mo = this.maxLevels, ml = this.maxLevels;
    let { x, y, width, height } = this.bounds;
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width / 2);
    height = Math.round(height / 2);

    let nodes: Nodes<T> = {};
    nodes[Quads.topLt] = QuadTree.create<T>(x, y, width, height, mo, ml, lev);
    nodes[Quads.topRt] = QuadTree.create<T>(x + width, y, width, height, mo, ml, lev);
    nodes[Quads.botLt] = QuadTree.create<T>(x, y + height, width, height, mo, ml, lev);
    nodes[Quads.botRt] = QuadTree.create<T>(x + width, y + height, width, height, mo, ml, lev);
    this.nodes = nodes;
    return nodes;
  }
}

export default QuadTree;