`import Kinematic from 'platter/space/kinematic'`
`import _Node from 'platter/space/node'`
`import _Group from 'platter/space/group'`
`import AABB from 'platter/geom/aabb'`

class Group extends _Group
  constructor: -> _Group.init(this, arguments...)

class Node extends _Node
  constructor: -> _Node.init(this, arguments...)

describe 'platter: space, kinematic', ->
  kinematic = null
  beforeEach -> kinematic = new Kinematic(0, 0)
  
  it 'should extend `Group`', ->
    expect(kinematic instanceof _Group).toBe true
  
  it 'should have a nodeType of `kinematic` & `group`', ->
    grp = !!(kinematic.type & _Node.types['group'])
    kin = !!(kinematic.type & _Node.types['kinematic'])
    expect(grp and kin).toBe true
  
  it 'should override `toString()`', ->
    str = 'Platter.space.Kinematic({x: 40, y: 10})'
    expect(new Kinematic(40, 10).toString()).toBe str
  
  it 'should not accept groups as children', ->
    node = new Node(0, 0)                           # No type at all.
    box = AABB.define().dimension(10, 10).create()  # Type is aabb.
    group = new Group(0, 0)                         # Type is group.
    
    fn1 = -> kinematic.adopt(node)
    fn2 = -> kinematic.adopt(box)
    fn3 = -> kinematic.adopt(group)
    
    expect(fn1).not.toThrow()
    expect(fn2).not.toThrow()
    expect(fn3).toThrow()