`import QuadTree from './broadphase/quad-tree'`

`import Point from './geom/point'`
`import Line from './geom/line'`
`import Circle from './geom/circle'`
`import AABB from './geom/aabb'`
`import ChainLink from './geom/chain-link'`
`import Chain from './geom/chain'`

`import Matrix from './math/matrix'`
`import { MutableVector, ImmutableVector } from './math/vector'`

`import Node from './space/node'`
`import Group from './space/group'`
`import Container from './space/container'`
`import Kinematic from './space/kinematic'`
`import Dynamic from './space/dynamic'`
`import World from './space/world'`

Platter = {
  broadphase: { QuadTree }
  geom: { Point, Line, Circle, AABB, ChainLink, Chain }
  math: { Matrix, MutableVector, ImmutableVector }
  space: { Node, Group, Container, Kinematic, Dynamic, World }
}

`export default Platter`