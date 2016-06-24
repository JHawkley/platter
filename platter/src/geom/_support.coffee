`import { set, setXY, mul, add, sub } from '../math/vector-math'`
`import distance from '../utils/distance'`

aabb = (out, aabb, v) ->
  { x: vx, y: vy } = v
  vx = switch
    when vx < 0 then -1
    when vx > 0 then 1
    else 0
  vy = switch
    when vy < 0 then -1
    when vy > 0 then 1
    else 0
  
  hWidth = aabb.width * 0.5
  hHeight = aabb.height * 0.5
  setXY(out, (vx * hWidth) + aabb.x + hWidth, (vy * hHeight) + aabb.y + hHeight)
  return out

circle = (out, c, v) ->
  set(out, v)
  out.length = 1
  mul(out, out, c.radius)
  add(out, out, c)
  return out

line = (out, line, v) ->
  { point1: p1, point2: p2 } = line
  set(out, p1)
  sub(out, out, p2)
  d1 = distance(out, v)
  mul(out, out, -1)
  d2 = distance(out, v)
  
  switch
    when d1 is d2
      set(out, p1)
      add(out, out, p2)
      mul(out, out, 0.5)
    when d1 < d2
      set(out, p1)
    else
      set(out, p2)
  return out

point = (out, p, v) -> set(out, p)

`export { aabb, circle, line, point }`