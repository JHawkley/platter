`import TIsland from 'platter/phys/toi-island'`

class TestMember
  constructor: ->
    @island = null

describe 'platter: phys, time of impact island', ->
  
  describe 'implementation', ->

    it 'should be able to initialize empty', ->
      island = TIsland.create()
      expect(island.members.length).toBe 0
    
    it 'should be able to start with a pair of members', ->
      a = new TestMember()
      b = new TestMember()
      
      island = TIsland.create(a, b)
      
      expect(island.members.length).toBe 2
      expect(island.members).toContain a
      expect(island.members).toContain b
      
      expect(a.island).toBe island
      expect(b.island).toBe island
    
    it 'should be able to add members', ->
      a = new TestMember()
      b = new TestMember()
      
      island = TIsland.create()
      
      island.add(a)
      expect(island.members).toContain a
      expect(a.island).toBe island
      
      island.add(b)
      expect(island.members).toContain b
      expect(b.island).toBe island
    
    it 'should not accept the candidate member if it is already part of an island', ->
      a = new TestMember()
      b = new TestMember()
      
      island1 = TIsland.create(a, b)
      island2 = TIsland.create()
      
      fn1 = -> island2.add(a)
      fn2 = -> TIsland.create(b)
      
      expect(fn1).toThrow()
      expect(fn2).toThrow()
    
    it 'should be able to absorb another island', ->
      a = new TestMember()
      b = new TestMember()
      c = new TestMember()
      d = new TestMember()
      e = new TestMember()
      
      island1 = TIsland.create(a, b)
      island2 = TIsland.create(c, d)
      island2.add(e)
      
      island1.absorb(island2)
      
      expect(island1.members.length).toBe 5
      for item in [a, b, c, d, e]
        expect(island1.members).toContain(item)
        expect(item.island).toBe(island1)
      expect(island2.members.length).toBe 0
    
    it 'should unset its members `island` property when destroyed', ->
      a = new TestMember()
      b = new TestMember()
      
      island = TIsland.create(a, b)
      
      expect(a.island).toBe island
      
      island.release()
      
      expect(a.island).toBeNull()
  
  describe 'linked-list behavior', ->
    islandA = null
    islandB = null
    islandC = null

    beforeEach ->
      islandA = TIsland.create()
      islandB = TIsland.create()
      islandC = TIsland.create()
      islandA.next = islandB;
      islandB.prev = islandA;
      islandB.next = islandC;
      islandC.prev = islandB;

    it 'should be able to tell it is in a list', ->
      expect(islandA.inList).toBe true
      expect(islandB.inList).toBe true
      expect(islandC.inList).toBe true
      expect(TIsland.create().inList).toBe false
    
    it 'should be able to tell it is the head of a list', ->
      expect(islandA.isHead).toBe true
      expect(islandB.isHead).toBe false
      expect(islandC.isHead).toBe false
    
    it 'should be able to tell it is the tail of a list', ->
      expect(islandA.isTail).toBe false
      expect(islandB.isTail).toBe false
      expect(islandC.isTail).toBe true

    it 'should be able to insert an island after another', ->
      newIsland = TIsland.create()
      islandB.insertAfter(newIsland)

      expect(islandB.next).toBe newIsland
      expect(islandC.prev).toBe newIsland
      expect(newIsland.prev).toBe islandB
      expect(newIsland.next).toBe islandC
    
    it 'should be able to insert an island before another', ->
      newIsland = TIsland.create()
      islandB.insertBefore(newIsland)

      expect(islandA.next).toBe newIsland
      expect(islandB.prev).toBe newIsland
      expect(newIsland.prev).toBe islandA
      expect(newIsland.next).toBe islandB
    
    it 'should not insert an island that is already part of a list', ->
      newIsland = TIsland.create()
      fn1 = -> newIsland.insertBefore(islandA)
      fn2 = -> newIsland.insertAfter(islandA)

      expect(fn1).toThrow()
      expect(fn2).toThrow()
  
    it 'should remove itself from a list of islands when released', ->
      expect(islandB.prev).toBe islandA
      expect(islandB.next).toBe islandC

      islandB.release()

      expect(islandB.prev?).toBe false
      expect(islandB.next?).toBe false

      expect(islandA.next).toBe islandC
      expect(islandC.prev).toBe islandA
    
    it 'should be able to release an entire list', ->
      expect(islandA.next).toBe islandB
      expect(islandB.next).toBe islandC

      TIsland.releaseList(islandB)

      expect(islandA.inList).toBe false
      expect(islandB.inList).toBe false
      expect(islandC.inList).toBe false
    
    it 'should be iterable', ->
      results = []
      iterateOn islandA, (val) -> results.push val

      expect(results).toEqual [islandA, islandB, islandC]