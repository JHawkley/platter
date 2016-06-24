`import Factory from 'platter/factory/base'`

describe 'platter: factory, base', ->
  
  class testCtor1
    testProp: 'something'
    testFn: (str) -> str + '-away'
  
  class testCtor2
    @init: (instance, name, health) ->
      instance.name = name
      instance.health = health
    constructor: -> return
  
  class testCtor3
  
    Object.defineProperty @prototype, 'x',
      get: -> @_data.x
      set: (val) -> @_data.x = val
    
    Object.defineProperty @prototype, 'y',
      get: -> @_data.y
      set: (val) -> @_data.y = val
    
    toRect: -> @_data.rect
    
    toString: -> "Platter.geom.Point({x: #{@x}, y: #{@y}})"
  
  it 'should take a class constructor in its constructor', ->
    factory = new Factory testCtor1
    
    expect(factory.ctor).toBe testCtor1
  
  it 'should be able to build an instance of the given class', ->
    factory = new Factory testCtor1
    
    instance = factory.define().create()
    
    expect(instance instanceof testCtor1).toBe true
    expect(instance instanceof factory.ctor).toBe true
    expect(instance.testProp).toBe 'something'
    expect(instance.testFn('fly')).toBe 'fly-away'
  
  it 'should be able to build via shorthand `factory.create()`', ->
    factory = new Factory testCtor1
    
    instance = factory.create()
    
    expect(instance.testProp).toBe 'something'
    expect(instance.testFn('fly')).toBe 'fly-away'
  
  it 'should be able to build multiple objects with `factory.create()`', ->
    factory = new Factory testCtor1
    
    fn = -> factory.create()
    
    expect(fn).not.toThrow()
    expect(fn).not.toThrow()
    expect(fn).not.toThrow()
  
  it 'should be able to reopen the class constructor', ->
    factory = new Factory testCtor1
    
    factory.reopen (ctor) -> class extends ctor
      testFn: (str) -> super(str + '-and')
    
    instance = factory.define().create()
    
    expect(instance instanceof factory.ctor).toBe true
    expect(instance.testProp).toBe 'something'
    expect(instance.testFn('up-up')).toBe 'up-up-and-away'
  
  it 'should pass the `create()` arguments to the class initializer', ->
    factory = new Factory testCtor2
    
    instance = factory.define().create('Klonoa', 16)
    
    expect(instance.name).toBe 'Klonoa'
    expect(instance.health).toBe 16
    
  it 'should be able to add methods', ->
    factory = new Factory testCtor3
    
    translateMethod =
      init: jasmine.createSpy('translate.init')
      apply: jasmine.createSpy('translate.apply')
    
    rectangleMethod =
      finalize: jasmine.createSpy('rectangle.finalize')
      seal: jasmine.createSpy('rectangle.seal')
    
    factory.method 'translate', translateMethod
    factory.method 'rectangle', rectangleMethod
    
    generator = factory.define()
    
    expect(translateMethod.init).toHaveBeenCalled()
    expect(translateMethod.apply).not.toHaveBeenCalled()
    
    generator.translate(2, 5)
    
    expect(translateMethod.apply).toHaveBeenCalledWith(2, 5)
    expect(rectangleMethod.finalize).not.toHaveBeenCalled()
    expect(rectangleMethod.seal).not.toHaveBeenCalled()
    
    instance = generator.create()
    
    expect(rectangleMethod.finalize).toHaveBeenCalled()
    expect(rectangleMethod.seal).toHaveBeenCalled()
  
  describe 'with a complete factory', ->
    factory = null
    translateMethod =
      init: -> @x = 0; @y = 0
      apply: (x, y) -> @x += x; @y += y
    rectangleMethod =
      finalize: -> @rect = { @x, @y, width: 0, height: 0 }
      seal: -> Object.freeze(@rect)
    
    beforeEach ->
      factory = new Factory testCtor3
      factory.method 'translate', translateMethod
      factory.method 'rectangle', rectangleMethod
    
    it 'should be able to tell if it has a method', ->
      expect(factory.hasMethod('translate')).toBe true
      expect(factory.hasMethod('rectangle', rectangleMethod)).toBe true
      
      expect(factory.hasMethod('does-not-exist')).toBe false
      expect(factory.hasMethod('translate', rectangleMethod)).toBe false
    
    it 'should create an object customized by methods', ->
      instance = factory.define().translate(5, 10).create()
      
      expect(instance.x).toBe 5
      expect(instance.y).toBe 10
      expect(Object.isFrozen(instance.toRect())).toBe true
      expect(instance.toRect()).toEqual { x: 5, y: 10, width: 0, height: 0 }
      expect(instance.toString()).toBe 'Platter.geom.Point({x: 5, y: 10})'
    
    it 'should only create one object when unsealed', ->
      generator = factory.define().translate(5, 10)
      fn = -> generator.create()
      
      expect(fn).not.toThrow()
      expect(fn).toThrow()
    
    it 'should create multiple objects when sealed', ->
      generator = factory.define().translate(5, 10).seal()
      fn = -> generator.create()
      
      expect(fn).not.toThrow()
      expect(fn).not.toThrow()
      expect(fn).not.toThrow()
    
    it 'should give a unique ID to each object created', ->
      generator = factory.define().translate(5, 10).seal()
      
      instance1 = generator.create()
      instance2 = generator.create()
      instance3 = generator.create()
      
      expect(instance1.id).not.toBe instance2.id
      expect(instance1.id).not.toBe instance3.id
      expect(instance2.id).not.toBe instance3.id
    
    it 'should give objects immutable IDs', ->
      instance = factory.define().translate(5, 10).create()
      
      fn = -> instance.id = -20
      
      expect(fn).toThrow()
    
    it 'should create an immutable `_data` structure', ->
      instance = factory.define().translate(5, 10).create()
      
      expect(Object.isFrozen(instance._data)).toBe true
      
    it 'should share the immutable data structure between instances', ->
      generator = factory.define().translate(5, 10).seal()
      
      instance1 = generator.create()
      instance2 = generator.create()
      instance3 = generator.create()
      
      expect(instance1._data).toBe instance2._data
      expect(instance1._data).toBe instance3._data
      expect(instance2._data).toBe instance3._data
    
    it 'should be capable of object pooling', ->
      generator1 = factory.define().translate(5, 10).seal()
      generator2 = factory.define().translate(8, 16).seal()
      
      instance1 = generator1.create()
      instance1.destroy = jasmine.createSpy('instance1.destroy')
      id = instance1.id
      
      expect(instance1.x).toBe 5
      expect(instance1.y).toBe 10
      
      instance1.release()
      
      expect(instance1.destroy).toHaveBeenCalled()
      
      instance1 = null
      instance2 = generator2.create()
      
      expect(instance2.x).toBe 8
      expect(instance2.y).toBe 16
      expect(instance2.id).toBe id