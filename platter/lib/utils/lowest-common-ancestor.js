define(["exports", "module"], function (exports, module) {
  "use strict";

  var lowestCommonAncestor;

  lowestCommonAncestor = function (nodeA, nodeB) {
    var lca, naAncestors;
    lca = null;
    naAncestors = [];
    nodeA.iterateUpToRoot(function (anc) {
      return naAncestors.push(anc);
    });
    nodeB.iterateUpToRoot(function (anc) {
      if (naAncestors.indexOf(anc) !== -1) {
        lca = anc;
        return false;
      }
    });
    return lca;
  };

  module.exports = lowestCommonAncestor;
});
