import Node from '../space/node';
import { Group } from '../space/group';
import { Maybe } from 'common/monads';

function lowestCommonAncestor(nodeA: Node, nodeB: Node): Maybe<Group> {
  let lca: Maybe<Group> = null;
  let naAncestors: Array<Node> = [];
  nodeA.iterateUpToRoot((anc) => naAncestors.push(anc) );
  nodeB.iterateUpToRoot((anc) => {
    if (naAncestors.indexOf(anc) !== -1) {
      lca = anc as any;
      return false;
    }
  });
  return lca;
}

export default lowestCommonAncestor;