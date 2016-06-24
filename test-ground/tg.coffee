findLineCircleIntersections = (circle, point1, point2) ->
  {x: cx, y: cy, radius} = circle
  dx = point2.x - point1.x
  dy = point2.y - point1.y
  
  A = dx * dx + dy * dy
  B = 2 * (dx * (point1.x - cx) + dy * (point1.y - cy))
  C = (point1.x - cx) * (point1.x - cx) + (point1.y - cy) * (point1.y - cy) - radius * radius
  
  det = B * B - 4 * A * C
  if A <= 0.0000001 or det < 0
    return []
  else if det is 0
    t = -B / (2 * A)
    return [{ x: point1.x + t * dx, y: point1.y + t * dy}]
  else
    t = (-B + Math.sqrt(det)) / (2 * A)
    i1 = { x: point1.x + t * dx, y: point1.y + t * dy }
    t = (-B - Math.sqrt(det)) / (2 * A)
    i2 = { x: point1.X + t * dx, y: point1.Y + t * dy }
    return [i1, i2]

d3 = window.d3

svg = d3.select('svg')