`import Factory from 'platter/factory/base'`
`import Node from 'platter/space/node'`
`import Primative from 'platter/geom/primative'`
`import { methods as primativeMethods } from 'platter/geom/primative'`

describe 'platter: geometry, primative', ->
  
  it 'should not be a factory', ->
    expect(Primative instanceof Factory).toBe false
  
  it 'should extend `Node`', ->
    expect(new Primative() instanceof Node).toBe true
  
  describe 'methods', ->
    
    describe 'translate', ->
    
      it 'should provide a means to position itself', ->
        test = {}
        primativeMethods.translate.init.call(test)
        
        expect(test).toEqual { x: 0, y: 0 }
        
        primativeMethods.translate.apply.call(test, 8, 16)
        
        expect(test).toEqual { x: 8, y: 16 }
        
        primativeMethods.translate.apply.call(test, 5, 10)
        
        expect(test).toEqual { x: 13, y: 26 }
  
  describe 'implementation', ->
    primative = null
    eHitBox = (1 << 2)
    fDmgBox = (1 << 3)
    
    beforeEach ->
      # Simulate a factory construction.
      _data = { x: 8, y: 16, type: 'test', filter: { group: eHitBox, mask: fDmgBox } }
      Object.freeze(_data.filter)
      Object.freeze(_data)
      
      primative = Object.create(Primative.prototype, id: {value: 11})
      primative._data = _data
      Primative.call(primative)
      
      spyOn(primative, 'makeProxy').and.returnValue null
  
    it 'should override `toString()`', ->
      matcher = toStringHelper('Platter.geom.Primative#', '({x: 8, y: 16})')
      expect(primative.toString()).toMatch matcher
    
    it 'should be immutable', ->
      props = ['x', 'y', 'type', 'filter']
      fns = ((-> primative[prop] = 0) for prop in props)
      
      expect(fn).toThrow() for fn in fns
      expect(primative[prop]).not.toBe(0) for prop in props
      return
    
    it 'should attempt to `makeProxy()` upon fetching a proxy for the first time', ->
      # Execute the getter.
      p = primative.proxy
      
      expect(primative.makeProxy).toHaveBeenCalled()