# .NET's rectangle intersection function.
# Test if two axis-aligned rectangles intersect.
rectRectIntersection = (a, b) ->
  x = Math.max(a.x, b.x)
  num1 = Math.min(a.x + a.width, b.x + b.width)
  y = Math.max(a.y, b.y)
  num2 = Math.min(a.y + a.height, b.y + b.height)
  return num1 >= x and num2 >= y
  
`export default rectRectIntersection`