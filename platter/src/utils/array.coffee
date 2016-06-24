# Garbage-less `removeAt` function.
removeAt = (arr, idx) ->
  throw new Error('index out of range') unless 0 <= idx < arr.length
  for i in [idx...(arr.length - 1)] by 1
    arr[i] = arr[i + 1]
  arr.length = arr.length - 1
  return

# Garbage-less `insertAt` function.
insertAt = (arr, obj, idx) ->
  throw new Error('index out of range') unless 0 <= idx <= arr.length
  arr.length += 1
  for i in [(arr.length - 1)...idx] by -1
    arr[i] = arr[i - 1]
  arr[idx] = obj
  return

isArray = (obj) -> Object::toString.call(obj) is '[object Array]'

`export { removeAt, insertAt, isArray }`