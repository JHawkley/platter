# Finds the nearest shared ancestor between two nodes in a tree.
#
# NOTE: This implementation can probably be improved.
lowestCommonAncestor = (nodeA, nodeB) ->
  lca = null
  naAncestors = []
  nodeA.iterateUpToRoot (anc) -> naAncestors.push anc
  nodeB.iterateUpToRoot (anc) ->
    if naAncestors.indexOf(anc) isnt -1
      lca = anc
      return false
  return lca

`export default lowestCommonAncestor`