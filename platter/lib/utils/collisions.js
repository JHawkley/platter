define(['exports', '../math/vector'], function (exports, _mathVector) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Vector = _interopRequireDefault(_mathVector);

  /*
  box vs box
    Self explanatory...
  
  box vs circle
    Case - When center is in corner voronoi region.
    Case - Circle contains the square.
      Use box's opposing edges as rays to "cut" the circle.  If only one ray
      cut the circle, make a third point from circle center and its radius
      closest to the ray that found no points.  Create an AABB from these
      3 or 4 points and use it in box-vs-box test.
    Else
      Use AABBs of both objects in box-vs-box test.
  
  box vs capsule
    Case - Both circles' centers are in corner voronoi.
      Use circle closest to the corner and perform normal box-vs-circle test.
    Else
      Use AABBs of both objects in box-vs-box test.
  
  box vs point
    Default
      Use zero width and height AABB in box-vs-box test.
      May be optimized later...
  
  box vs line
    Default
      Use box's opposing edges and line as rays; find intersection points
      between line ray and both box rays.  For any points not along the
      line-segment, discard and replace with segment's extents.
      (Or, use any line-segment points in between the two box rays, and
      only perform the above for those points that fall outside.)
  
  box vs parallelagram
    Case - Parallelagram and its AABB are identical in shape.
      Use AABBs of both objects in box-vs-box test.
    Default
      Use box's opposing edges and non-axis-aligned edges as rays.
      Perform the same algorithm as in box-vs-line test, generating
      four points instead of two.  Create a bounding box from these four
      points and use it in box-vs-box test.
  
  capsule vs circle
    
  
  capsule vs capsule
  capsule vs line
  capsule vs point
  capsule vs parallelogram
  
  circle vs circle
    Case - Use equation below to obtain the amount to add to one axis
      of the vector that separates the circle's centers to make them
      touch.  If value is negative, circles are not touching.
  
  circle vs line
  circle vs point     (containment?)
  circle vs parallelogram
  line vs line
  line vs point
  line vs parallelogram
  point vs parallelogram
  
  http://www.dyn4j.org/2010/01/sat/
  
  (x,y) are vectors to the other circle's center-point.
  r = circle 1's radius
  s = circle 2's radius
  d is the translation vector to separate the circles.
  (y+d)^2+x^2=(r+s)^2
   */
  var aabb_aabb_intersection, aabb_aabb_penetration, wp, xAxis, yAxis;

  xAxis = _Vector['default'].create(1, 0);

  yAxis = _Vector['default'].create(0, 1);

  wp = {
    x: 0,
    y: 0
  };

  aabb_aabb_penetration = function (a, b, out) {
    var num1, num2, x, y;
    x = Math.max(a.x, b.x);
    num1 = Math.min(a.x + a.width, b.x + b.width);
    y = Math.max(a.y, b.y);
    num2 = Math.min(a.y + a.height, b.y + b.height);
    out.x = num1 - x;
    out.y = num2;
    return out;
  };

  aabb_aabb_intersection = function (a, b) {
    aabb_aabb_penetration(a, b, wp);
    return wp.x >= 0 && wp.y >= 0;
  };
});
