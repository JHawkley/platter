`import Vector from '../math/vector'`
`import Simplex from '../geom/simplex'`



support = (A, B, v) ->
  d = v.asMutable()
  p1 = A.support(d)
  p2 = B.support(d.mulEq(-1))
  p1.subEq(p2)
  
  p2.release()
  d.release()
  
  return p1

tripleProduct = (a, b, c) ->
  bac = b.mul(a.dot(c))
  cab = c.mul(a.dot(b))
  
  bac.subEq(cab)
  cab.release()
  
  return bac

containsOrigin = (simplex, d) ->
  retVal = false
  { a, b } = simplex
  ao = a.mul(-1)
  ab = b.sub(a)
  
  if simplex.points.length is 3
    c = simplex.c
    ac = c.sub(a)
    
    abPerp = tripleProduct(ac, ab, ab)
    if abPerp.dot(ao) > 0
      simplex.removeC()
      d.set(abPerp)
    else
      acPerp = tripleProduct(ab, ac, ac)
      if acPerp.dot(ao) > 0
        simplex.removeB()
        d.set(acPerp)
      else
        retVal = true
      acPerp.release()
    ac.release()
  else
    abPerp = tripleProduct(ab, ao, ab)
    d.set(abPerp)
  
  ao.release(); ab.release(); abPerp.release()
  return retVal

gjk = (A, B) ->
  ca = A.getCenter()
  cb = B.getCenter()
  d = cb.subEq(ca)
  ca.release()
  
  simplex = Simplex.create support(A, B, d)
  d.mulEq(-1)
  
  retVal = false
  
  loop
    simplex.add support(A, B, d)
    if simplex.a.dot(d) <= 0
      retVal = false
      break
    if containsOrigin(simplex, d)
      retVal = true
      break
  
  d.release()
  simplex.release()
  
  return retVal