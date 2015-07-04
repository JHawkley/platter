`import Node from 'platter/space/node'`
`import Chain from 'platter/geom/chain'`
`import { methods as chainMethods } from 'platter/geom/chain'`
`import Primative from 'platter/geom/primative'`
`import { methods as primativeMethods } from 'platter/geom/primative'`
`import { iterateOn } from 'platter/utils/es6'`

cp = (pt1, pt2) -> return switch
  when not (pt1? and pt2?) then false
  when pt1.x isnt pt2.x then false
  when pt1.y isnt pt2.y then false
  else true

describe 'platter: geometry, chain', ->
  
  point1 = { x: 0, y: 0 }
  point2 = { x: 4, y: 4 }
  point3 = { x: 8, y: 8 }
  point4 = { x: 12, y: 12 }
  
  it 'should extend `Primative`', ->
    instance = Chain.define().points(point1, point2).create()
    expect(instance instanceof Primative).toBe true
  
  describe 'methods', ->
    
    it 'should have methods provided by Primative', ->
      for k, v of primativeMethods
        expect(Chain.hasMethod(k, v)).toBe true
    
    it 'should have methods provided for itself', ->
      for k, v of chainMethods
        expect(Chain.hasMethod(k, v)).toBe true
    
    describe 'points', ->
      
      it 'should add one or more points', ->
        test = {}
        chainMethods.points.init.call(test)
        
        expect(test.points).toEqual []
        
        chainMethods.points.apply.call(test, point1, point2)
        
        expect(test.points).toEqual [point1, point2]
        
        chainMethods.points.apply.call(test, [point3, point4])
        
        expect(test.points).toEqual [point1, point2, point3, point4]
        
        expect(Object.isFrozen(test.points)).toBe false
        chainMethods.points.seal.call(test)
        expect(Object.isFrozen(test.points)).toBe true
      
      it 'should remove sequences of duplicate points', ->
        test = { points: [] }
        chainMethods.points.apply.call(test, point1, point2, point2, point3, point2)
        
        expect(test.points).toEqual [point1, point2, point2, point3, point2]
        
        chainMethods.points.finalize.call(test)
        
        expect(test.points).toEqual [point1, point2, point3, point2]
      
      it 'should fail if the chain was closed', ->
        test = { points: [] }
        chainMethods.points.apply.call(test, point1, point2, point3, point4, point1)
        test.closed = true
        
        fn = -> chainMethods.points.apply.call(test, point2)
        
        expect(fn).toThrow()
      
      it 'should fail if too many duplicates are removed to make a line', ->
        test = { points: [] }
        chainMethods.points.apply.call(test, point1, point1, point1)
        
        expect(test.points).toEqual [point1, point1, point1]
        
        fn = -> chainMethods.points.finalize.call(test)
        
        expect(fn).toThrow()
      
      it 'should fail if there are not enough points to make a closed polygon', ->
        test = { points: [] }
        chainMethods.points.apply.call(test, point1, point2, point2, point1)
        test.closed = true
        
        expect(test.points).toEqual [point1, point2, point2, point1]
        
        fn = -> chainMethods.points.finalize.call(test)
        
        expect(fn).toThrow()
    
    describe 'add', ->
      
      it 'should add a single point to the chain', ->
        test = { points: [] }
        
        chainMethods.add.apply.call(test, point1)
        
        expect(test.points).toEqual [point1]
        
        chainMethods.add.apply.call(test, 30, 30)
        
        expect(test.points).toEqual [point1, {x: 30, y: 30}]
      
      it 'should fail if the chain was closed', ->
        test = { points: [point1, point2, point3, point4, point1], closed: true }
        
        fn = -> chainMethods.add.apply.call(test, point2)
        
        expect(fn).toThrow()
    
    describe 'close', ->
      
      it 'should close the loop', ->
        test = {}
        chainMethods.close.init.call(test)
        
        expect(test.closed).toBe false
        
        test.points = [point1, point2, point3, point4]
        chainMethods.close.apply.call(test)
        
        expect(test.points).toEqual [point1, point2, point3, point4, point1]
        expect(test.closed).toBe true
        
        fn = -> chainMethods.close.finalize.call(test)
        
        expect(fn).not.toThrow()
      
      it 'should add no points if the loop is already closed', ->
        test = { points: [point1, point2, point3, point4, point1], closed: false }
        chainMethods.close.apply.call(test)
        
        expect(test.points).toEqual [point1, point2, point3, point4, point1]
        expect(test.closed).toBe true
      
      it 'should automatically flag as closed if manually closed', ->
        test = { points: [point1, point2, point3, point4, point1], closed: false }
        chainMethods.close.finalize.call(test)
        
        expect(test.points).toEqual [point1, point2, point3, point4, point1]
        expect(test.closed).toBe true
      
      it 'should fail to automatically close if too few points', ->
        test = { points: [point1, point2, point1], closed: false }
        fn = -> chainMethods.close.finalize.call(test)
        
        expect(fn).toThrow()
      
      it 'should fail if the loop was already closed', ->
        test = { points: [point1, point2, point3, point4], closed: false }
        fn = -> chainMethods.close.apply.call(test)
        
        expect(fn).not.toThrow()
        expect(fn).toThrow()
    
    describe 'reverse', ->
      
      it 'should set the reverse flag', ->
        test = {}
        chainMethods.reverse.init.call(test)
        
        expect(test.reversed).toBe false
        
        chainMethods.reverse.apply.call(test)
        
        expect(test.reversed).toBe true
    
    describe 'links', ->
      
      eHitBox = (1 << 2)
      fDmgBox = (1 << 3)
      
      it 'should create chain-link generators for each posiible line', ->
        test = { x: 2, y: 4, filter: { group: 0x00000000, mask: 0x00000000} }
        chainMethods.links.init.call(test)
        
        expect(test.links).toEqual []
        
        test.points = [point1, point2, point3, point4, point1]
        
        chainMethods.links.seal.call(test)
        
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
          x: 2, y: 4, links: [], reversed: true
          filter: { group: 0x00000000, mask: 0x00000000}
          points: [point1, point2, point3, point4, point1]
        }
        
        chainMethods.links.seal.call(test)
        
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
      
      it 'should apply the chain\'s filter group & mask to the links', ->
        test = { links: [] }
        test.filter = { group: eHitBox, mask: fDmgBox }
        test.points = [point1, point2, point3, point4, point1]
        
        chainMethods.links.seal.call(test)
        
        host = {}
        links = (gen.create(host) for gen in test.links)
        
        for link in links
          expect(link.filter.group).toBe eHitBox
          expect(link.filter.mask).toBe fDmgBox
      
      it 'should be able to use the generators multiple times', ->
        test = { links: [] }
        test.filter = { group: eHitBox, mask: fDmgBox }
        test.points = [point1, point2, point3, point4, point1]
        
        chainMethods.links.seal.call(test)
        
        host = {}
        fn = -> links = (gen.create(host) for gen in test.links)
        
        expect(fn).not.toThrow()
        expect(fn).not.toThrow()
        expect(fn).not.toThrow()
    
    describe 'rectangle', ->
      
      it 'should provide appropriate dimensions', ->
        mp = (x, y) -> {x, y}
        test = { x: 2, y: 4, points: [mp(5, 5), mp(5, 10), mp(15, 10), mp(15, 5)] }
        chainMethods.rectangle.finalize.call(test)
        
        expect(test.rect?).toBe true
        expect(test.rect).toEqual { x: 7, y: 9, width: 10, height: 5 }
        
        expect(Object.isFrozen(test.rect)).toBe false
        chainMethods.rectangle.seal.call(test)
        expect(Object.isFrozen(test.rect)).toBe true
    
    describe 'type', ->
    
      it 'should set a type of `chain`', ->
        test = {}
        chainMethods.type.finalize.call(test)
        expect(test.type).toBe Node.types['chain']
  
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
      
      it 'should override `toString()`', ->
        matcher = toStringHelper('Platter.geom.Chain#', '({links.length: 3})')
        expect(chain.toString()).toMatch matcher
      
      it 'should implement the `toRect()` interface', ->
        rect = chain.toRect()
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
          expect(link._data?).toBe true
        
        chain.release()
        
        for link in linkRefs
          expect(link._data?).toBe false