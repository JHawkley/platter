`import TIsland from 'platter/phys/toi-island'`

class TestMember
  constructor: ->
    @island = null

describe 'platter: phys, time of impact island', ->
  
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