root = global ? window

isInArray = (a, e) -> e in a
isEqArrays = (a1, a2) ->
  return false if a1.length isnt a2.length
  for e in a1 then return false if not isInArray(a2, e)
  return true

root.similarArray = (a2) -> { asymmetricMatch: (a1) -> isEqArrays(a1, a2) }