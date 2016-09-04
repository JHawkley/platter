`import { compareAngleRadians as qr } from 'platter/utils/angle-compare'`
`import { compareAngleDegrees as qd } from 'platter/utils/angle-compare'`

describe 'platter: utilities, angle comparisons', ->
  
  it 'should compare two angles, in radians', ->
    expect(qr(Math.PI, Math.PI)).toBe true
    expect(qr(0, Math.PI * 2)).toBe true
    expect(qr(-Math.PI, Math.PI)).toBe true
  
  it 'should compare two angles, in degrees', ->
    expect(qd(180, 180)).toBe true
    expect(qd(0, 360)).toBe true
    expect(qd(-180, 180)).toBe true