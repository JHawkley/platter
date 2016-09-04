/**
 * Garbage-less `removeAt` function.
 * This version may change the ordering of the array.  Use `removeAtStable`
 * if maintaining the ordering is important.
 * 
 * @template T
 * @param {Array<T>} arr The array to remove from.
 * @param {number} idx The index of the element to remove.
 * @returns {Array<T>}
 */
function removeAtFast<T>(arr: Array<T>, idx: number): Array<T> {
  if (idx < 0 || idx >= arr.length)
    throw new Error('index out of range');
  let val = arr.pop();
  if (idx !== arr.length) arr[idx] = val as T;
  return arr;
}

/**
 * Garbage-less `removeAt` function.
 * This version does not alter the order of the array.  If order is not
 * important, use the faster `removeAt` version instead.
 * 
 * @template T
 * @param {Array<T>} arr The array to remove from.
 * @param {number} idx The index of the element to remove.
 * @returns {Array<T>}
 */
function removeAtStable<T>(arr: Array<T>, idx: number): Array<T> {
  if (idx < 0 || idx >= arr.length)
    throw new Error('index out of range');
  for (let i = idx, len = arr.length; i < len - 1; i++)
    arr[i] = arr[i + 1];
  arr.length = arr.length - 1
  return arr;
}

/**
 * Garbage-less `insertAt` function.
 * 
 * @template T
 * @param {Array<T>} arr The array to insert into.
 * @param {T} obj The object to insert.
 * @param {number} idx The index into which to insert the object.
 * @returns {Array<T>}
 */
function insertAt<T>(arr: Array<T>, obj: T, idx: number): Array<T> {
  if (idx < 0 || idx > arr.length)
    throw new Error('index out of range');
  arr.length += 1;
  for(let i = arr.length - 1; i > idx; i--)
    arr[i] = arr[i - 1];
  arr[idx] = obj;
  return arr;
}

/**
 * Tests if the given object is an array.
 * 
 * @template T
 * @param {*} obj The object to test.
 * @returns {obj is Array<T>}
 */
let isArray = Array.isArray || function isArray(obj: any): obj is Array<any> {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

/**
 * Removes all duplicate elements, as determined by the `equalityFn`, from `arr`.
 * Array is modified in-place.
 * 
 * @template T
 * @param {Array<T>} arr The array to remove non-unique elements from.
 * @param {(a: T, b: T) => boolean} equalityFn A function for determining equality between elements.
 * @param {*} [thisArg] The object to be used as the current object.
 * @returns {Array<T>}
 */
function uniq<T>(arr: Array<T>, equalityFn: (a: T, b: T) => boolean, thisArg?: any): Array<T> {
  let i = 0;
  while (i < arr.length) {
    let v1 = arr[i];
    let j = i + 1;
    while (j < arr.length) {
      let v2 = arr[j];
      if (equalityFn.call(thisArg, v1, v2)) removeAtStable(arr, j); else j++;
    }
    i++;
  }
  return arr;
}

/**
 * Removes all elements from `arr` that pass the test implemented by `testFn`.
 * Array is modified in-place.
 * 
 * @template T
 * @param {Array<T>} arr The array to filter elements from.
 * @param {(a: T) => boolean} testFn A function determining if an element qualifies to stay.
 * @param {*} [thisArg] The object to be used as the current object.
 * @returns {Array<T>}
 */
function filter<T>(arr: Array<T>, testFn: (a: T) => boolean, thisArg?: any): Array<T> {
  let i = 0;
  while (i < arr.length) {
    let v = arr[i];
    if (!testFn.call(thisArg, v)) removeAtStable(arr, i); else i++;
  }
  return arr;
}

export { removeAtStable as removeAt, removeAtFast, removeAtStable, insertAt, isArray, uniq, filter };