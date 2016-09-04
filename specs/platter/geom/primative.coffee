`import Factory from 'platter/factory/base'`
`import { Node, TypeMethod } from 'platter/space/node'`
`import { Primative as _Primative } from 'platter/geom/primative'`
`import { TranslateMethod } from 'platter/geom/primative'`

Primative = Factory.from((class extends _Primative), TranslateMethod, TypeMethod)

describe 'platter: geometry, primative', ->
  
  it 'should not be a factory', ->
    expect(_Primative instanceof Factory).toBe false
  
  it 'should extend `Node`', ->
    expect(Primative.create() instanceof Node).toBe true
  
  describe 'methods', ->
    
    describe 'translate', ->
    
      it 'should provide a means to position itself', ->
        test = {}
        TranslateMethod.init.call(test)
        
        expect(test).toEqual { x: 0, y: 0 }
        
        TranslateMethod.apply.call(test, 8, 16)
        
        expect(test).toEqual { x: 8, y: 16 }
        
        TranslateMethod.apply.call(test, 5, 10)
        
        expect(test).toEqual { x: 13, y: 26 }
  
  describe 'implementation', ->
    primative = null
    
    beforeEach ->
      primative = Primative.define().translate(8, 16).create()
    
    it 'should be immutable', ->
      props = ['x', 'y', 'type']
      fns = ((-> primative[prop] = 0) for prop in props)
      
      expect(fn).toThrow() for fn in fns
      expect(primative[prop]).not.toBe(0) for prop in props
      return