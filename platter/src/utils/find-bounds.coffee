# Generates a rectangle which contains all the rectangles in `arr`.
findBounds = (out, arr) ->
  if arr.length is 0
    out.x = 0; out.y = 0; out.width = 0; out.height = 0
    return out
  else
    top = left = Number.POSITIVE_INFINITY
    bottom = right = Number.NEGATIVE_INFINITY
    for rect in arr
      { x, y, width, height } = rect
      
      top = Math.min(top, y)
      left = Math.min(left, x)
      bottom = Math.max(bottom, y + height)
      right = Math.max(right, x + width)
    
    out.x = left; out.y = top
    out.width = right - left
    out.height = bottom - top
    return out

`export default findBounds`