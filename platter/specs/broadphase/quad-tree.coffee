`import QuadTree from 'platter/broadphase/quad-tree'`

quadNone = 0
quadTL = (1 << 0)
quadTR = (1 << 1)
quadBL = (1 << 2)
quadBR = (1 << 3)
quadAll = quadTL | quadTR | quadBL | quadBR

class Line
  constructor: (@x1, @y1, @x2, @y2) -> return
  toRect: ->
    x = Math.min(@x1, @x2)
    y = Math.min(@y1, @y2)
    width = Math.abs(@x1 - @x2)
    height = Math.abs(@y1 - @y2)
    return { x, y, width, height }
  toString: -> "Line({#{@x1}, #{@y1}} -> {#{@x2}, #{@y2}}"
    
class Box
  constructor: (@x, @y, @width, @height) -> return
  toRect: -> this
  toString: -> "Box({x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}})"

describe 'platter: broad-phase, quad-tree', ->
  tree = null
  beforeEach -> tree = new QuadTree({x: 0, y: 0, width: 20, height: 20}, 4, 4)
  
  it 'should insert an object that does not implement `toRect()`', ->
    object = { x: 2, y: 3, width: 5, height: 5 }
    tree.insert object
    expect(tree.objects[0]).toBe object
  
  it 'should insert an object that does implement `toRect()`', ->
    object = new Line(2, 3, 7, 8)
    tree.insert object
    expect(tree.objects[0]).toBe object
  
  it 'should obtain appropriate quadrants for a variety of objects', ->
    expect(tree.getQuads(new Box(2.5, 2.5, 5, 5))).toBe quadTL
    expect(tree.getQuads(new Box(12.5, 2.5, 5, 5))).toBe quadTR
    expect(tree.getQuads(new Box(2.5, 12.5, 5, 5))).toBe quadBL
    expect(tree.getQuads(new Box(12.5, 12.5, 5, 5))).toBe quadBR
    expect(tree.getQuads(new Box(7.5, 7.5, 5, 5))).toBe quadAll
    expect(tree.getQuads(new Box(2.5, -10, 5, 5))).toBe quadTL
    expect(tree.getQuads(new Box(21, 10, 5, 5))).toBe (quadTR | quadBR)
    expect(tree.getQuads(new Box(2.5, 7.5, 5, 5))).toBe (quadTL | quadBL)
  
  it 'should split when (maxObjects + 1) objects are inserted', ->
    spyOn(tree, 'split').and.callThrough()
    tree.insert new Box(0, 0, 4, 4)
    tree.insert new Box(2, 3, 5, 7)
    tree.insert new Box(9, 11, 6, 4)
    tree.insert new Box(4, 4, 6, 6)
    expect(tree.split).not.toHaveBeenCalled()
    tree.insert new Box(15, 15, 4, 4)
    expect(tree.split).toHaveBeenCalled()
  
  it 'should distribute the objects appropriately after splitting', ->
    boxes = [
      new Box(2.5, 2.5, 5, 5)
      new Box(12.5, 2.5, 5, 5)
      new Box(2.5, 12.5, 5, 5)
      new Box(12.5, 12.5, 5, 5)
      new Box(7.5, 7.5, 5, 5)
      new Box(21, 10, 5, 5)
    ]
    tree.insert(box) for box in boxes
    
    expect(tree.objects).toEqual [boxes[4], boxes[5]]
    expect(tree.nodes[quadTL].objects).toEqual [boxes[0]]
    expect(tree.nodes[quadTR].objects).toEqual [boxes[1]]
    expect(tree.nodes[quadBL].objects).toEqual [boxes[2]]
    expect(tree.nodes[quadBR].objects).toEqual [boxes[3]]
    
  it 'should count touching as being in a quadrant', ->
    boxes = [
      new Box(2.5, 2.5, 5, 5)
      new Box(12.5, 12.5, 5, 5)
      new Box(5, 2, 5, 8)
      new Box(10, 0, 5, 10)
      new Box(5, 10, 5, 8)
      new Box(10, 10, 5, 10)
      new Box(7.5, 7.5, 5, 5)
    ]
    tree.insert(box) for box in boxes
    
    expect(tree.objects).toEqual [boxes[2], boxes[3], boxes[4], boxes[5], boxes[6]]
    expect(tree.nodes[quadTL].objects).toEqual [boxes[0]]
    expect(tree.nodes[quadTR].objects.length).toBe 0
    expect(tree.nodes[quadBL].objects.length).toBe 0
    expect(tree.nodes[quadBR].objects).toEqual [boxes[1]]
  
  it 'should only split `maxLevels` times', ->
    for i in [0..5]
      div = Math.pow(2, i)
      for k in [0...5]
        tree.insert new Box(1 / div, 1 / div, 9 / div, 9 / div)
    
    level = 0
    recurse = (tree) ->
      level = Math.max(level, tree.level)
      recurse(node) for q, node of tree.nodes if tree.nodes?
    recurse(tree)
          
    expect(level).toBe tree.maxLevels
  
  it 'should retrieve plausible collision candidates', ->
    boxes = [
      new Box(2.5, 2.5, 5, 5)
      new Box(12.5, 2.5, 5, 5)
      new Box(2.5, 12.5, 5, 5)
      new Box(12.5, 12.5, 5, 5)
      new Box(7.5, 7.5, 5, 5)
    ]
    tree.insert(box) for box in boxes
    
    targets = [
      { x: 1, y: 5, width: 8, height: 10 }
      { x: 11, y: 5, width: 8, height: 10 }
      { x: 5, y: 1, width: 10, height: 8 }
      { x: 5, y: 11, width: 10, height: 8}
      { x: 11, y: 11, width: 8, height: 8 }
      { x: 1, y: 1, width: 18, height: 18 }
    ]
    
    results = [
      [0, 2, 4]
      [1, 3, 4]
      [0, 1, 4]
      [2, 3, 4]
      [3, 4]
      [0, 1, 2, 3, 4]
    ]
    
    for target, i in targets
      found = tree.retrieve(target)
      for k in [0...boxes.length]
        if k in results[i]
          expect(found).toContain boxes[k]
        else
          expect(found).not.toContain boxes[k]
  
  it 'should be clearable', ->
    boxes = [
      new Box(2.5, 2.5, 5, 5)
      new Box(12.5, 2.5, 5, 5)
      new Box(2.5, 12.5, 5, 5)
      new Box(12.5, 12.5, 5, 5)
      new Box(7.5, 7.5, 5, 5)
    ]
    tree.insert(box) for box in boxes
    expect(tree.objects).toEqual [boxes[4]]
    expect(tree.nodes?).toBe true
    tree.clear()
    expect(tree.objects.length).toBe(0)
    expect(tree.nodes?).toBe false
  
  it 'should be resettable to new bounds', ->
    boxes = [
      new Box(2.5, 2.5, 5, 5)
      new Box(12.5, 2.5, 5, 5)
      new Box(2.5, 12.5, 5, 5)
      new Box(12.5, 12.5, 5, 5)
      new Box(7.5, 7.5, 5, 5)
    ]
    tree.insert(box) for box in boxes
    expect(tree.objects).toEqual [boxes[4]]
    expect(tree.nodes?).toBe true
    tree.reset({x: 0, y: 0, width: 40, height: 40})
    expect(tree.objects.length).toBe(0)
    expect(tree.nodes?).toBe false
    expect(tree.bounds).toEqual {x: 0, y: 0, width: 40, height: 40}