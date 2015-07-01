`import Container from 'platter/space/container'`
`import _Node from 'platter/space/node'`
`import _Group from 'platter/space/group'`

class Group extends _Group
  constructor: -> _Group.init(this, arguments...)

class Node extends _Node
  constructor: -> _Node.init(this, arguments...)

class Box
  constructor: (@x, @y, @width, @height) ->
    @type = Node.addType 'test-box'
  toRect: -> this
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: space, container', ->
  container = null
  beforeEach -> container = new Container(0, 0)
  
  it 'should extend `Group`', ->
    expect(container instanceof _Group).toBe true
    
  it 'should have a nodeType of `container` & `group`', ->
    grp = !!(container.type & _Node.types['group'])
    con = !!(container.type & _Node.types['container'])
    expect(grp and con).toBe true
  
  it 'should override `toString()`', ->
    str = 'Platter.space.Container({x: 40, y: 10})'
    expect(new Container(40, 10).toString()).toBe str
  
  it 'should only accept groups as children', ->
    node = new Node(0, 0)   # No type at all.
    box = new Box(0, 0)     # Type is test-box.
    group = new Group(0, 0) # Type is group.
    
    fn1 = -> container.adopt(node)
    fn2 = -> container.adopt(box)
    fn3 = -> container.adopt(group)
    
    expect(fn1).toThrow()
    expect(fn2).toThrow()
    expect(fn3).not.toThrow()