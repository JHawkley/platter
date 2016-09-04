export type Maybe<T> = T | undefined | null;
export type Trial<T> = Error | T;

/**
 * Determines if the Maybe has a value.
 * 
 * @template T
 * @param {Maybe<T>} m The Maybe to test.
 * @returns {m is T} Whether the Maybe is a value of T.
 */
function hasValue<T>(m: Maybe<T>): m is T {
  return m != null;
}

function isFunction<T>(fn: T | (() => T)): fn is (() => T) {
  return typeof fn === 'function';
}

/**
 * Gets the value, if present, or otherwise returns the given default value.
 * The `defaultValue` may be a function that evaluates to an appropriate value.
 * 
 * @template T
 * @param {Maybe<T>} m The Maybe to attempt to get.
 * @param {(T | (() => T))} defaultValue The value to use if Maybe is nothing.
 * @param {*} [thisArg] The object to be used as the current object.
 * @returns {T} Either the value of the Maybe or the default value.
 */
function getOrElse<T>(m: Maybe<T>, defaultValue: T | (() => T), thisArg?: any): T {
  if (hasValue<T>(m)) return m;
  else if (isFunction(defaultValue)) return defaultValue.call(thisArg);
  else return <T> defaultValue;
}

/**
 * Takes the value of `m` and, if it is something, applies `fn` to it and
 * returns a new `Maybe` of the function's return type.  If it is nothing,
 * then the value remains nothing.
 * 
 * @template T
 * @template U
 * @param {Maybe<T>} m The `Maybe` to apply the function to.
 * @param {(val: T) => U} fn The function that will be applied.
 * @param {*} [thisArg] The object to be used as the current object.
 * @returns {Maybe<U>} The result of `fn` or `null`, if `m` was also `null`.
 */
function mapOn<T, U>(m: Maybe<T>, fn: (val: T) => U, thisArg?: any): Maybe<U> {
  return hasValue(m) ? fn.call(thisArg, m) : null;
}

/**
 * Takes the value of `m` and, if it is something, applies `fn` to it.
 * The return value of `fn` is discarded.
 * 
 * @template T
 * @param {Maybe<T>} m The `Maybe` to apply the function to.
 * @param {(val: T) => void} fn The function that will be applied.
 * @param {*} [thisArg] The object to be used as the current object.
 */
function actOn<T>(m: Maybe<T>, fn: (val: T) => void, thisArg?: any): void {
  if (hasValue(m)) fn.call(thisArg, m);
}

/**
 * Determines if the Trial was an error.
 * 
 * @template T
 * @param {Trial<T>} trial The Trial to test.
 * @returns {trial is Error} Whether the Trial is an Error.
 */
function isError<T>(trial: Trial<T>): trial is Error {
  return trial instanceof Error;
}

/**
 * Determines if the Trial wasn't an Error.
 * 
 * @template T
 * @param {Trial<T>} trial The Trial to test.
 * @returns {trial is T} Whether the Trial is a value of T.
 */
function isValue<T>(trial: Trial<T>): trial is T {
  return trial instanceof Error;
}

export { hasValue, getOrElse, mapOn, actOn, isError, isValue };