`import Node from 'platter/space/node'`
`import ChainLink from 'platter/geom/chain-link'`
`import { methods as chainLinkMethods } from 'platter/geom/chain-link'`
`import Line from 'platter/geom/line'`
`import { methods as lineMethods } from 'platter/geom/line'`
`import { methods as primativeMethods } from 'platter/geom/primative'`

describe 'platter: geometry, chain-link', ->
  
  it 'should extend `Line`', ->
    instance = ChainLink.define().from(13, 20).to(5, 9).create({})
    expect(instance instanceof Line.ctor).toBe true
  
  describe 'methods', ->
    
    it 'should have methods provided by Primative', ->
      for k, v of primativeMethods
        expect(ChainLink.hasMethod(k, v)).toBe true
    
    it 'should have methods provided by Line, except `type`', ->
      for k, v of lineMethods when k isnt 'type'
        expect(ChainLink.hasMethod(k, v)).toBe true
      expect(ChainLink.hasMethod('type', lineMethods.type)).toBe false
    
    it 'should have methods provided for itself', ->
      for k, v of chainLinkMethods
        expect(ChainLink.hasMethod(k, v)).toBe true
    
    describe 'type', ->
      
      it 'should set a type of `line` and `chain-link`', ->
        types = Node.types
        test = {}
        chainLinkMethods.type.finalize.call(test)
        expect(test.type).toBe(types['line'] | types['chain-link'])
  
  describe 'implementation', ->
  
    it 'should override `toString()`', ->
      instance = ChainLink.define().from(13, 20).to(5, 9).create({})
      matcher = toStringHelper('Platter.geom.ChainLink#', '({x: 13, y: 20}, {x: 5, y: 9})')
      expect(instance.toString()).toMatch matcher
    
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