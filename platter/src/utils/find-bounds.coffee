# Generates a rectangle which contains all the rectangles in `arr`.
findBounds = (arr, ref = {}) ->
  if arr.length is 0
    ref.x = 0; ref.y = 0; ref.width = 0; ref.height = 0
    return ref
  else
    top = left = Number.POSITIVE_INFINITY
    bottom = right = Number.NEGATIVE_INFINITY
    for rect in arr
      { x, y, width, height } = rect
      
      top = Math.min(top, y)
      left = Math.min(left, x)
      bottom = Math.max(bottom, y + height)
      right = Math.max(right, x + width)
    
    ref.x = left; ref.y = top
    ref.width = right - left
    ref.height = bottom - top
    return ref

`export default findBounds`