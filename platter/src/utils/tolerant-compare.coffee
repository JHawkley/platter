# Compares floating point values with some tolerance (epsilon).
tolerantCompare = (f1, f2) -> Math.abs(f1 - f2) < 1e-14

`export default tolerantCompare`