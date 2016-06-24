`import Factory from 'platter/factory/base'`
`import Container from 'platter/space/container'`
`import { container as tContainer } from 'platter/space/_type'`
`import { methods as containerMethods } from 'platter/space/container'`
`import _Node, { methods as nodeMethods } from 'platter/space/node'`
`import CallbackType from 'platter/callback/type'`
`import CallbackOptions from 'platter/callback/options'`
`import Group from 'platter/space/group'`
`import { group as tGroup } from 'platter/space/_type'`
`import { methods as groupMethods } from 'platter/space/group'`

Node = new Factory(_Node)
tTestBox = CallbackType.add 'test-box'

class Box
  constructor: (@x, @y, @width, @height) ->
    @type = tTestBox
  toRect: -> this
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: space, container', ->
  
  describe 'methods', ->
    
    it 'should have methods provided by Node', ->
      for k, v of nodeMethods
        expect(Container.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Group, excluding some methods', ->
      for k, v of groupMethods
        if k not in ['filter', 'include', 'typeGroup']
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
        
        expect(test.filter.included).toEqual [tGroup]
        expect(test.filter.excluded).toEqual []
        
        containerMethods.filter.seal.call(test)
        expect(test.filter instanceof CallbackOptions).toBe true
        expect(test.filter.isSealed).toBe true
        
        expect(test.filter.included).toBe tGroup.value
        expect(test.filter.excluded).toBe 0x00000000
    
    describe 'typeGroup', ->
      
      it 'should set a type of `group` and `container`', ->
        test = { type: [] }
        containerMethods.typeGroup.finalize.call(test)
        expect(test.type).toContain tGroup
        expect(test.type).toContain tContainer
  
  describe 'implementation', ->
    
    container = null
    beforeEach -> container = Container.create(0, 0)
    
    it 'should extend `Group`', ->
      expect(container instanceof Group.ctor).toBe true
      
    it 'should have a node type of `container` & `group`', ->
      grp = tGroup.test(container.type)
      con = tContainer.test(container.type)
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