`import Dynamic from 'platter/space/dynamic'`
`import _Node from 'platter/space/node'`
`import _Group from 'platter/space/group'`
`import AABB from 'platter/geom/aabb'`

class Group extends _Group
  constructor: -> _Group.init(this, arguments...)

class Node extends _Node
  constructor: -> _Node.init(this, arguments...)

describe 'platter: space, dynamic', ->
  dynamic = null
  beforeEach -> dynamic = new Dynamic(0, 0)
  
  it 'should extend `Group`', ->
    expect(dynamic instanceof _Group).toBe true
  
  it 'should have a nodeType of `dynamic` & `group`', ->
    grp = !!(dynamic.type & _Node.types['group'])
    dyn = !!(dynamic.type & _Node.types['dynamic'])
    expect(grp and dyn).toBe true
  
  it 'should override `toString()`', ->
    str = 'Platter.space.Dynamic({x: 40, y: 10})'
    expect(new Dynamic(40, 10).toString()).toBe str
  
  it 'should not accept groups as children', ->
    node = new Node(0, 0)                           # No type at all.
    box = AABB.define().dimension(10, 10).create()  # Type is aabb.
    group = new Group(0, 0)                         # Type is group.
    
    fn1 = -> dynamic.adopt(node)
    fn2 = -> dynamic.adopt(box)
    fn3 = -> dynamic.adopt(group)
    
    expect(fn1).not.toThrow()
    expect(fn2).not.toThrow()
    expect(fn3).toThrow()