`import World from 'platter/space/world'`
`import _Group from 'platter/space/group'`
`import Node from 'platter/space/node'`

class Group extends _Group
  constructor: -> _Group.init(this, arguments...)

describe 'platter: space, world', ->
  world = null
  beforeEach -> world = new World(width: 4000, height: 240)
  
  it 'should extend `Group`', ->
    expect(world instanceof _Group).toBe true
  
  it 'should have a nodeType of `world` & `group`', ->
    grp = !!(world.type & Node.types['group'])
    wld = !!(world.type & Node.types['world'])
    expect(grp and wld).toBe true
  
  it 'should override `toString()`', ->
    str = 'Platter.space.World({x: 0, y: 0, width: 4000, height: 240})'
    expect(world.toString()).toBe str
  
  describe 'time', ->
    
    it 'should run a time step', ->
      expect(world.time).toBe 0
      world.step(0.33)
      expect(world.time).toBe 0.33
        
    it 'should run several time steps', ->
      expect(world.time).toBe 0
      world.step(0.25)
      world.step(0.25)
      world.step(0.25)
      world.step(0.25)
      expect(world.time).toBe 1
  
  describe 'place in the graph', ->
    
    it 'should not be able to have a parent', ->
      group = new Group()
      fn = -> world.parent = group
      
      expect(fn).toThrow()
    
    it 'should not be able to be adopted', ->
      group = new Group()
      fn = -> world.wasAdoptedBy(group)
      
      expect(fn).toThrow()
  
  describe 'rectangles & `asRect()`', ->
    
    it 'should implement the `asRect()` interface', ->
      expected = { x: 0, y: 0, width: 4000, height: 240 }
      rect = world.asRect()
      for prop, val of expected
        expect(rect[prop]).toBe val