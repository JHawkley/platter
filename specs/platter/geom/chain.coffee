`import Chain, { Methods as methChain, Type as tChain } from 'platter/geom/chain'`
`import { Primative, Methods as methPrimative } from 'platter/geom/primative'`
`import { Methods as methNode } from 'platter/space/node'`
`import CallbackType from 'platter/callback/type'`
`import CallbackMetatype from 'platter/callback/meta-type'`
`import { MutableVector as Vector } from 'platter/math/vector'`
`import Rect from 'platter/math/rect'`

cp = (pt1, pt2) -> return switch
  when not (pt1? and pt2?) then false
  when pt1.x isnt pt2.x then false
  when pt1.y isnt pt2.y then false
  else true

tTestType1 = CallbackType.add 'test-type-1'
tTestType2 = CallbackType.add 'test-type-2'

describe 'platter: geometry, chain', ->
  
  point1 = { x: 0, y: 0 }
  point2 = { x: 4, y: 4 }
  point3 = { x: 8, y: 8 }
  point4 = { x: 12, y: 12 }
  
  it 'should extend `Primative`', ->
    instance = Chain.define().points(point1, point2).create()
    expect(instance instanceof Primative).toBe true
  
  describe 'methods', ->
    
    it 'should have methods provided by Node, excluding some methods', ->
      for k, v of methNode
        if k not in ['type']
          expect(Chain.hasMethod(k, v)).toBe true
        else
          expect(Chain.hasMethod(k, v)).toBe false
    
    it 'should have methods provided by Primative', ->
      for k, v of methPrimative
        expect(Chain.hasMethod(k, v)).toBe true
    
    it 'should have methods provided for itself', ->
      for k, v of methChain
        expect(Chain.hasMethod(k, v)).toBe true
    
    describe 'points', ->
      
      it 'should add one or more points', ->
        test = {}
        methChain.points.init.call(test)
        
        expect(test.points).toEqual []
        
        methChain.points.apply.call(test, point1, point2)
        
        expect(test.points).toEqual [point1, point2]
        
        methChain.points.apply.call(test, [point3, point4])
        
        expect(test.points).toEqual [point1, point2, point3, point4]
        
        expect(Object.isFrozen(test.points)).toBe false
        methChain.points.seal.call(test)
        expect(Object.isFrozen(test.points)).toBe true
      
      it 'should remove sequences of duplicate points', ->
        test = { points: [] }
        methChain.points.apply.call(test, point1, point2, point2, point3, point2)
        
        expect(test.points).toEqual [point1, point2, point2, point3, point2]
        
        methChain.points.finalize.call(test)
        
        expect(test.points).toEqual [point1, point2, point3, point2]
      
      it 'should fail if the chain was closed', ->
        test = { points: [] }
        methChain.points.apply.call(test, point1, point2, point3, point4, point1)
        test.closed = true
        
        fn = -> methChain.points.apply.call(test, point2)
        
        expect(fn).toThrow()
      
      it 'should fail if too many duplicates are removed to make a line', ->
        test = { points: [] }
        methChain.points.apply.call(test, point1, point1, point1)
        
        expect(test.points).toEqual [point1, point1, point1]
        
        fn = -> methChain.points.finalize.call(test)
        
        expect(fn).toThrow()
      
      it 'should fail if there are not enough points to make a closed polygon', ->
        test = { points: [] }
        methChain.points.apply.call(test, point1, point2, point2, point1)
        test.closed = true
        
        expect(test.points).toEqual [point1, point2, point2, point1]
        
        fn = -> methChain.points.finalize.call(test)
        
        expect(fn).toThrow()
    
    describe 'add', ->
      
      it 'should add a single point to the chain', ->
        test = { points: [] }
        
        methChain.add.apply.call(test, point1)
        
        expect(test.points).toEqual [point1]
        
        methChain.add.apply.call(test, 30, 30)
        
        expect(test.points).toEqual [point1, {x: 30, y: 30}]
      
      it 'should fail if the chain was closed', ->
        test = { points: [point1, point2, point3, point4, point1], closed: true }
        
        fn = -> methChain.add.apply.call(test, point2)
        
        expect(fn).toThrow()
    
    describe 'close', ->
      
      it 'should close the loop', ->
        test = {}
        methChain.close.init.call(test)
        
        expect(test.closed).toBe false
        
        test.points = [point1, point2, point3, point4]
        methChain.close.apply.call(test)
        
        expect(test.points).toEqual [point1, point2, point3, point4, point1]
        expect(test.closed).toBe true
        
        fn = -> methChain.close.finalize.call(test)
        
        expect(fn).not.toThrow()
      
      it 'should add no points if the loop is already closed', ->
        test = { points: [point1, point2, point3, point4, point1], closed: false }
        methChain.close.apply.call(test)
        
        expect(test.points).toEqual [point1, point2, point3, point4, point1]
        expect(test.closed).toBe true
      
      it 'should automatically flag as closed if manually closed', ->
        test = { points: [point1, point2, point3, point4, point1], closed: false }
        methChain.close.finalize.call(test)
        
        expect(test.points).toEqual [point1, point2, point3, point4, point1]
        expect(test.closed).toBe true
      
      it 'should fail to automatically close if too few points', ->
        test = { points: [point1, point2, point1], closed: false }
        fn = -> methChain.close.finalize.call(test)
        
        expect(fn).toThrow()
      
      it 'should fail if the loop was already closed', ->
        test = { points: [point1, point2, point3, point4], closed: false }
        fn = -> methChain.close.apply.call(test)
        
        expect(fn).not.toThrow()
        expect(fn).toThrow()
    
    describe 'reverse', ->
      
      it 'should set the reverse flag', ->
        test = {}
        methChain.reverse.init.call(test)
        
        expect(test.reversed).toBe false
        
        methChain.reverse.apply.call(test)
        
        expect(test.reversed).toBe true
    
    describe 'links', ->
      
      it 'should create chain-link generators for each possible line', ->
        test = { x: 2, y: 4, chainType: [] }
        methChain.links.init.call(test)
        
        expect(test.links).toEqual []
        
        test.points = [point1, point2, point3, point4, point1]
        
        methChain.links.seal.call(test)
        
        expect(Object.isFrozen(test.links)).toBe true
        expect(test.links.length).toBe 4
        
        expectation = for point in [point1, point2, point3, point4]
          { x: point.x + 2, y: point.y + 4 }
        
        host = {}
        links = (gen.create(host) for gen in test.links)
        for link, i in links then switch i
          when 0
            expect(cp(link.point1, expectation[0])).toBe true
            expect(cp(link.point2, expectation[1])).toBe true
          when 1
            expect(cp(link.point1, expectation[1])).toBe true
            expect(cp(link.point2, expectation[2])).toBe true
          when 2
            expect(cp(link.point1, expectation[2])).toBe true
            expect(cp(link.point2, expectation[3])).toBe true
          when 3
            expect(cp(link.point1, expectation[3])).toBe true
            expect(cp(link.point2, expectation[0])).toBe true
      
      it 'should reverse the winding when the `reverse` flag is set', ->
        test = {
          x: 2, y: 4, links: [], reversed: true, chainType: []
          points: [point1, point2, point3, point4, point1]
        }
        
        methChain.links.seal.call(test)
        
        expect(Object.isFrozen(test.links)).toBe true
        expect(test.links.length).toBe 4
        
        expectation = for point in [point1, point4, point3, point2]
          { x: point.x + 2, y: point.y + 4 }
        
        host = {}
        links = (gen.create(host) for gen in test.links)
        for link, i in links then switch i
          when 0
            expect(cp(link.point1, expectation[0])).toBe true
            expect(cp(link.point2, expectation[1])).toBe true
          when 1
            expect(cp(link.point1, expectation[1])).toBe true
            expect(cp(link.point2, expectation[2])).toBe true
          when 2
            expect(cp(link.point1, expectation[2])).toBe true
            expect(cp(link.point2, expectation[3])).toBe true
          when 3
            expect(cp(link.point1, expectation[3])).toBe true
            expect(cp(link.point2, expectation[0])).toBe true
      
      it 'should apply the chain\'s type to the links', ->
        test = { links: [] }
        test.type = [tChain, tTestType1, tTestType2]
        test.chainType = [tTestType1, tTestType2]
        test.points = [point1, point2, point3, point4, point1]
        
        methChain.links.seal.call(test)
        
        expect(test.chainType).toBeUndefined()
        
        host = {}
        links = (gen.create(host) for gen in test.links)
        
        for link in links
          expect(link.type.test(tTestType1)).toBe true
          expect(link.type.test(tTestType2)).toBe true
      
      it 'should be able to use the generators multiple times', ->
        test = { links: [] }
        test.type = [tChain, tTestType1, tTestType2]
        test.chainType = [tTestType1, tTestType2]
        test.points = [point1, point2, point3, point4, point1]
        
        methChain.links.seal.call(test)
        
        host = {}
        fn = -> links = (gen.create(host) for gen in test.links)
        
        expect(fn).not.toThrow()
        expect(fn).not.toThrow()
        expect(fn).not.toThrow()
    
    describe 'rectangle', ->
      
      it 'should provide appropriate dimensions', ->
        mp = (x, y) -> {x, y}
        test = { x: 2, y: 4, points: [mp(5, 5), mp(5, 10), mp(15, 10), mp(15, 5)] }
        methChain.rectangle.finalize.call(test)
        
        expect(test.rect?).toBe true
        expect(test.rect).toEqual { x: 7, y: 9, width: 10, height: 5 }
        
        expect(Object.isFrozen(test.rect)).toBe false
        methChain.rectangle.seal.call(test)
        expect(Object.isFrozen(test.rect)).toBe true
    
    describe 'type', ->
      
      it 'should initialize the type arrays', ->
        test = {}
        methChain.type.init.call(test)
        
        expect(test.type).toEqual []
        expect(test.chainType).toEqual []
      
      it 'should provide a means to add a type', ->
        test = { type: [], chainType: [] }
        
        methChain.type.apply.call(test, tTestType1)
        
        expect(test.type).toContain tTestType1
        expect(test.chainType).toContain tTestType1
      
      it 'should provide a means to add several types', ->
        test = { type: [], chainType: [] }
        
        methChain.type.apply.call(test, [tTestType1, tTestType2])
        
        expect(test.type).toContain tTestType1
        expect(test.type).toContain tTestType2
        
        expect(test.chainType).toContain tTestType1
        expect(test.chainType).toContain tTestType2
      
      it 'should seal the types by creating a meta-type', ->
        test = { type: [ tTestType1, tTestType2 ] }
        sType = tTestType1.value | tTestType2.value
        
        methChain.type.seal.call(test)
        
        expect(test.type instanceof CallbackMetatype).toBe true
        expect(test.type.value).toBe sType
    
    describe 'setType', ->
    
      it 'should set a type of `chain`', ->
        test = { type: [] }
        methChain.setType.finalize.call(test)
        expect(test.type).toContain tChain
  
  describe 'implementation', ->
    chainGen = null
    
    beforeEach ->
      chainGen = Chain.define()
        .add(5, 5)
        .add(5, 10)
        .add(15, 10)
        .add(15, 5)
  
    describe 'with chain-links added, open', ->
      chain = null
      
      beforeEach -> chain = chainGen.create()

      it 'should implement the `proxy` interface, by throwing', ->
        fn = -> proxy = chain.proxy
        
        expect(fn).toThrow()
      
      it 'should implement the `support()` interface, by throwing', ->
        fn = -> chain.support(Vector.create(), Vector.create(0, -1))

        expect(fn).toThrow()
      
      it 'should implement the `centerOf()` interface', ->
        pt = chain.centerOf(Vector.create())

        expect(pt.x).toBe 10
        expect(pt.y).toBe 7.5
      
      it 'should implement the `toRect()` interface', ->
        rect = chain.toRect(Rect.create())
        expectation = { x: 5, y: 5, width: 10, height: 5 }
        
        for k of expectation
          expect(rect[k]).toBe expectation[k]
        return
      
      it 'should have appropriate values for `next` and `prev` on links', ->
        for link, i in chain.links
          if i - 1 >= 0
            prev = chain.links[i - 1]
            expect(link.prev).toBe prev
          else
            expect(link.prev?).toBe false
          if i + 1 < chain.links.length
            next = chain.links[i + 1]
            expect(link.next).toBe next
          else
            expect(link.next?).toBe false
    
    describe 'with chain-links added, closed', ->
      chain = null
      
      beforeEach -> chain = chainGen.close().create()
      
      it 'should close the loop', ->
        [firstLink, otherLinks..., lastLink, closedLink] = chain.links
  
        expect(closedLink.point1.x).toBe 15
        expect(closedLink.point1.y).toBe 5
        expect(closedLink.point2.x).toBe 5
        expect(closedLink.point2.y).toBe 5
        
        expect(closedLink.prev).toBe lastLink
        expect(closedLink.next).toBe firstLink
        expect(lastLink.next).toBe closedLink
        expect(firstLink.prev).toBe closedLink
      
    describe 'es6-compatible iterator', ->
      chain = null
      
      beforeEach -> chain = chainGen.close().create()
      
      it 'should iterate over the hosted chain-links', ->
        results = []
        iterateOn chain, (val) -> results.push val
        
        expect(chain.links).toEqual results
      
    describe 'object-pooling', ->
      chain = null
      
      beforeEach -> chain = chainGen.close().create()
      
      it 'should release all links when destroyed', ->
        linkRefs = chain.links[..]
        
        # A spy would be better, but `release` is immutable.
        for link in linkRefs
          expect(link._immutData?).toBe true
        
        chain.release()
        
        for link in linkRefs
          expect(link._immutData?).toBe false