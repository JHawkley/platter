`import ChainLink, { Methods as methChainLink, Type as tChainLink } from 'platter/geom/chain-link'`
`import { Line, Methods as methLine, Type as tLine } from 'platter/geom/line'`
`import { Methods as methNode } from 'platter/space/node'`
`import { Methods as methPrimative } from 'platter/geom/primative'`
`import Group from 'platter/space/group'`

describe 'platter: geometry, chain-link', ->
  
  it 'should extend `Line`', ->
    instance = ChainLink.define().from(13, 20).to(5, 9).create({})
    expect(instance instanceof Line).toBe true
  
  describe 'methods', ->
    
    it 'should have methods provided by Node', ->
      for k, v of methNode
        expect(ChainLink.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Primative', ->
      for k, v of methPrimative
        expect(ChainLink.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Line, except `setType`', ->
      for k, v of methLine when k isnt 'setType'
        expect(ChainLink.hasMethod(k, v)).toBe true
      expect(ChainLink.hasMethod('typeGroup', methLine.typeGroup)).toBe false
    
    it 'should have methods provided for itself', ->
      for k, v of methChainLink
        expect(ChainLink.hasMethod(k, v)).toBe true
    
    describe 'setType', ->
      
      it 'should set a type of `line` and `chain-link`', ->
        test = { type: [] }
        methChainLink.setType.finalize.call(test)
        
        expect(test.type).toContain tLine
        expect(test.type).toContain tChainLink
  
  describe 'implementation', ->
    
    xit 'should implement the `proxy` interface', ->
      instance = ChainLink.define().from(13, 20).to(5, 9).create({})
      proxy = instance.proxy
      
      expect(proxy).toEqual jasmine.anything()
      # Also should not use the LineProxy class, which is what would
      # happen if the class didn't override the implementation of `Line`.
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