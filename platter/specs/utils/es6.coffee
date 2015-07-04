`import { iteratorSymbol, iterateOn as iOn, isIterable } from 'platter/utils/es6'`
`import { es6_iterateOn, es5_iterateOn } from 'platter/utils/es6'`

sym = Symbol?.iterator ? '@@iterator'

class FakeArray
  constructor: ->
    this[i] = v for v, i in arguments
    @length = arguments.length
    return
  this.prototype[sym] = ->
    nextIndex = 0
    return {
      next: =>
        return if nextIndex < @length
          { value: this[nextIndex++], done: false }
        else
          { done: true }
    }

class FakeHash
  constructor: (obj) ->
    @keys = (k for k of obj)
    @hash = obj
  this.prototype[sym] = ->
    nextIndex = 0
    return {
      next: =>
        return if nextIndex < @keys.length
          { value: @hash[@keys[nextIndex++]], done: false }
        else
          { done: true }
    }

describe 'platter: utilities, es6', ->
  
  describe 'iteratorSymbol', ->
  
    it 'should be defined', ->
      arr = ['@@iterator']
      arr.push Symbol.iterator if Symbol?.iterator?
      expect(iteratorSymbol in arr).toBe true
  
  describe 'isIterable', ->
    
    it 'should be able to detect an iterable', ->
      testIterable = new FakeArray('work', 'it', 'hot', 'stuff')
      expect(isIterable(testIterable)).toBe true
  
  describe 'iterateOn', ->
    testArray = null
    testHash = null
    
    beforeEach ->
      testArray = new FakeArray('work', 'it', 'hot', 'stuff')
      testHash = new FakeHash(zero: 0, one: 1, two: 2, three: 3)
      
    it 'should be defined as `iterateOn` on the module', ->
      expect(typeof iOn).toBe 'function'
    
    for ver, iterateOn of { es6: es6_iterateOn, es5: es5_iterateOn }
      describe "#{ver} version", ->
        
        if iterateOn?
          it 'should not iterate over something that isn\'t iterable', ->
            fn = -> iterateOn {}, (val) -> results.push val
            expect(fn).toThrow()
          
          it 'should iterate over any object that provides an iterator', ->
            results = []
            iterateOn testArray, (val) -> results.push val
            
            expect(results).toEqual ['work', 'it', 'hot', 'stuff']
            
            results = []
            iterateOn testHash, (val) -> results.push val
            
            expect(results.length).toBe 4
            expect(results).toContain 0
            expect(results).toContain 1
            expect(results).toContain 2
            expect(results).toContain 3
          
          it 'should iterate over any object that is itself an iterator', ->
            results = []
            iter = testArray[iteratorSymbol]()
            iterateOn iter, (val) -> results.push val
            
            expect(results).toEqual ['work', 'it', 'hot', 'stuff']
            
            results = []
            iter = testHash[iteratorSymbol]()
            iterateOn iter, (val) -> results.push val
            
            expect(results.length).toBe 4
            expect(results).toContain 0
            expect(results).toContain 1
            expect(results).toContain 2
            expect(results).toContain 3
        else
          it 'should report the inability to test', ->
            console.log 'cannot test; feature not supported by test environment'