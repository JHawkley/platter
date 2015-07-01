`import Factory from 'platter/factory/base'`
`import Container from 'platter/space/container'`
`import { methods as containerMethods } from 'platter/space/container'`
`import _Node from 'platter/space/node'`
`import Group from 'platter/space/group'`
`import { methods as groupMethods } from 'platter/space/group'`

Node = new Factory(_Node)

class Box
  typeGroup = _Node.addType 'test-box'
  constructor: (@x, @y, @width, @height) ->
    @type = typeGroup
  toRect: -> this
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: space, container', ->
  
  describe 'methods', ->
    
    fContainer = _Node.types['container']
    fGroup = _Node.types['group']
    
    it 'should have methods provided by Group, excluding some methods', ->
      for k, v of groupMethods
        if k not in ['filter', 'allow', 'type']
          expect(Container.hasMethod(k, v)).toBe true
        else
          expect(Container.hasMethod(k, v)).toBe false
        
    it 'should have methods provided for itself', ->
      for k, v of containerMethods
        expect(Container.hasMethod(k, v)).toBe true
    
    describe 'filter', ->
      
      it 'should initialize to allow only groups and seal the filter', ->
        test = {}
        containerMethods.filter.init.call(test)
        
        expect(test.filter.allowed).toBe fGroup
        expect(test.filter.excluded).toBe 0x00000000
        
        expect(Object.isFrozen(test.filter)).toBe false
        containerMethods.filter.seal.call(test)
        expect(Object.isFrozen(test.filter)).toBe true
    
    describe 'type', ->
      
      it 'should set a type of `group` and `container`', ->
        test = {}
        containerMethods.type.finalize.call(test)
        expect(test.type).toBe(fGroup | fContainer)
  
  describe 'implementation', ->
    
    container = null
    beforeEach -> container = Container.create(0, 0)
    
    it 'should extend `Group`', ->
      expect(container instanceof Group.ctor).toBe true
      
    it 'should have a nodeType of `container` & `group`', ->
      grp = !!(container.type & _Node.types['group'])
      con = !!(container.type & _Node.types['container'])
      expect(grp and con).toBe true
    
    it 'should override `toString()`', ->
      matcher = toStringHelper('Platter.space.Container#', '({x: 40, y: 10})')
      expect(Container.create(40, 10).toString()).toMatch matcher
    
    it 'should only accept groups as children', ->
      node = Node.create(0, 0)   # No type at all.
      box = new Box(0, 0)     # Type is test-box.
      group = Group.create(0, 0) # Type is group.
      
      fn1 = -> container.adopt(node)
      fn2 = -> container.adopt(box)
      fn3 = -> container.adopt(group)
      
      expect(fn1).toThrow()
      expect(fn2).toThrow()
      expect(fn3).not.toThrow()