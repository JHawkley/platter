set = (out, op) -> out.x = op.x; out.y = op.y; return out
setXY = (out, x, y) -> out.x = x; out.y = y; return out
add = (out, a, b) -> setXY(out, a.x + b.x, a.y + b.y)
sub = (out, a, b) -> setXY(out, a.x - b.x, a.y - b.y)
mul = (out, op, s) -> setXY(out, op.x * s, op.y * s)
length = (op) ->
  { x, y } = op
  return Math.sqrt(x*x + y*y)
makeLength = (out, op, len) ->
  switch
    when len < 0 then throw new Error('length must not be less than 0')
    when len is 0 then setXY(out, 0, 0)
    when op.x is 0 and op.y is 0 then setXY(out, 0, len)
    else mul(out, op, len / length(op))
angle = (op) -> Math.atan2(op.x, op.y)
rotate = (out, op, ra) ->
  x = op.x; y = op.y; ra *= -1
  ax = Math.sin(ra)
  ay = Math.cos(ra)
  return setXY(out, x * ay - y * ax, x * ax + y * ay)
unit = (out, op) ->
  if op.x is 0 and op.y is 0 then x = 0; y = 0
  else il = 1 / length(op); x = op.x * il; y = op.y * il
  return setXY(out, x, y)
dot = (a, b) -> (a.x * b.x) + (a.y * b.y)
cross = (a, b) -> (a.x * b.y) - (a.y * b.x)

`export { set, setXY }`
`export { add, sub, mul }`
`export { length, makeLength }`
`export { angle, rotate }`
`export { unit }`
`export { dot, cross }`