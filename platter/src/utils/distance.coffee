distance = (p1, p2) ->
  x = p2.x - p1.x; y = p2.y - p1.y
  return Math.sqrt(x*x+y*y)

`export default distance`