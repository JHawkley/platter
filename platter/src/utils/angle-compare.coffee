`import q from './tolerant-compare'`

pi2 = Math.PI * 2

normalizeAngle_Deg = (input) -> input %% 360
normalizeAngle_Rad = (input) -> input %% pi2

compareAngle_Deg = (a, b) ->
  a = normalizeAngle_Deg(a) unless 0 <= a < 360
  b = normalizeAngle_Deg(b) unless 0 <= b < 360
  return q(a, b)

compareAngle_Rad = (a, b) ->
  a = normalizeAngle_Rad(a) unless 0 <= a < pi2
  b = normalizeAngle_Rad(b) unless 0 <= b < pi2
  return q(a, b)

`export { compareAngle_Deg as compareAngleDegrees }`
`export { compareAngle_Rad as compareAngleRadians }`
`export default compareAngle_Rad`