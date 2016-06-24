`import ChainLink from 'platter/geom/chain-link'`
`import { methods as chainLinkMethods } from 'platter/geom/chain-link'`
`import { chainLink as tChainLink } from 'platter/geom/_type'`
`import Line from 'platter/geom/line'`
`import { methods as lineMethods } from 'platter/geom/line'`
`import { line as tLine } from 'platter/geom/_type'`
`import { methods as nodeMethods } from 'platter/space/node'`
`import { methods as primativeMethods } from 'platter/geom/primative'`
`import Group from 'platter/space/group'`

describe 'platter: geometry, chain-link', ->
  
  it 'should extend `Line`', ->
    instance = ChainLink.define().from(13, 20).to(5, 9).create({})
    expect(instance instanceof Line.ctor).toBe true
  
  describe 'methods', ->
    
    it 'should have methods provided by Node', ->
      for k, v of nodeMethods
        expect(ChainLink.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Primative', ->
      for k, v of primativeMethods
        expect(ChainLink.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Line, except `typeGroup`', ->
      for k, v of lineMethods when k isnt 'typeGroup'
        expect(ChainLink.hasMethod(k, v)).toBe true
      expect(ChainLink.hasMethod('typeGroup', lineMethods.typeGroup)).toBe false
    
    it 'should have methods provided for itself', ->
      for k, v of chainLinkMethods
        expect(ChainLink.hasMethod(k, v)).toBe true
    
    describe 'type', ->
      
      it 'should set a type of `line` and `chain-link`', ->
        test = { type: [] }
        chainLinkMethods.typeGroup.finalize.call(test)
        
        expect(test.type).toContain tLine
        expect(test.type).toContain tChainLink
  
  describe 'implementation', ->
  
    it 'should override `toString()`', ->
      instance = ChainLink.define().from(13, 20).to(5, 9).create({})
      matcher = toStringHelper('Platter.geom.ChainLink#', '({x: 13, y: 20}, {x: 5, y: 9})')
      expect(instance.toString()).toMatch matcher
    
    xit 'should implement the `makeProxy()` interface', ->
      instance = ChainLink.define().from(13, 20).to(5, 9).create({})
      fn = -> proxy = instance.makeProxy()
      
      expect(fn).not.toThrow()
      # Also should not use the LineProxy, as it would if this
      # method didn't override `Line.makeProxy()`.
      expect(proxy instanceof ChainLinkProxy.ctor).toBe true
    
    it 'should not be able to be a child of a group', ->
      instance = ChainLink.define().from(13, 20).to(5, 9).create({})
      group = Group.create()
      fn = -> group.adopt(instance)
      
      expect(fn).toThrow()
    
    it 'should have instance constructor to set `host`', ->
      host = {id: 0, getPrev: (-> prevLink), getNext: (-> nextLink)}
      prevLink = {id: 1}
      nextLink = {id: 2}
      
      instance = ChainLink.define()
        .from(13, 20).to(5, 9)
        .create(host, prevLink, nextLink)
      
      expect(instance.host).toBe host
      expect(instance.prev).toBe prevLink
      expect(instance.next).toBe nextLink
    
    it 'should have immutable instance data', ->
      host = {id: 0}
      prevLink = {id: 1}
      nextLink = {id: 2}
      
      instance = ChainLink.define()
        .from(13, 20).to(5, 9)
        .create(host, prevLink, nextLink)
      
      fn1 = -> instance.host = null
      fn2 = -> instance.prev = null
      fn3 = -> instance.next = null
      
      expect(fn1).toThrow()
      expect(fn2).toThrow()
      expect(fn3).toThrow()
      expect(Object.isFrozen(instance._instanceData)).toBe true
    
    it 'should destroy the immutable instance data when released', ->
      host = {id: 0}
      prevLink = {id: 1}
      nextLink = {id: 2}
      
      instance = ChainLink.define()
        .from(13, 20).to(5, 9)
        .create(host, prevLink, nextLink)
      
      expect(instance._instanceData?).toBe true
      
      instance.release()
      
      expect(instance._instanceData?).toBe false