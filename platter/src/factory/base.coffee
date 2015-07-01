class Factory

  nextId = 0
  
  constructor: (ctor) ->
    
    methods = {}
    initializers = {}
    appliers = {}
    sealers = {}
    finalizers = {}
    pool = []
    
    _shortHandGenerator = null
    
    Object.defineProperty this, 'ctor', get: -> ctor
    
    # Creates a generator for describing the object to be produced.
    # Use methods to alter the definition of the object, then call
    # `seal()` to make the definition immutable.  Call `create()`
    # to produce a new instance of the object.  Each instance will
    # share the definition as its `_data` property.
    @define = ->
      _definition = {}
      _sealers = {}
      _stage = 0
      
      generator = Object.create appliers,
        definition: { value: _definition }
        sealers: { value: _sealers }
        isSealed: { get: -> _stage isnt 0 }
        # Seals the definition, making its underlying data immutable.
        seal: value: ->
          if _stage isnt 0
            throw new Error('stage invalid for sealing')
          for k, finalizer of finalizers
            finalizer.call(this)
          for k of _sealers
            sealers[k]?.call(_definition)
          Object.freeze(_definition)
          _stage = 1
          return this
        # Creates an object with the immutable data.  The data is
        # assigned to `_data` on the new object.  It is possible that
        # instances of `ctor` may be recycled.
        create: value: ->
          switch _stage
            when 0
              @seal()
              _stage = -1
            when 1
              _stage = 2
            when -1
              throw new Error('cannot create more than one when unsealed')
          obj = pool.pop() ? Object.create ctor.prototype,
            release: value: ->
              @destroy?()
              @_data = null
              pool.push this
            id: value: nextId++
          obj._data = _definition
          ctor.apply(obj, arguments)
          return obj
      
      init.call(generator) for k, init of initializers
      
      return generator
    
    # Short-hand creator; produces a generator without any method
    # customization and then creates an object immediately.
    # Useful when the factory is producing objects that don't require
    # any customization of the immutable data.
    @create = ->
      _shortHandGenerator ?= @define().seal()
      _shortHandGenerator.create(arguments...)
    
    # Extends or replaces the constructor used by the factory with new
    # methods and properties.  The current constructor is provided
    # as the only argument to `fn`, and if a value is returned,
    # it will replace the constructor.
    @reopen = (fn) -> ctor = fn(ctor) ? ctor
    
    # Adds a construction method to the factory.  Methods are given
    # a `name` and provide a `hash` with a set of functions with special
    # meaning:
    #   `hash.init` is called when the generator is first created to
    #     initialize the definition for later customization.
    #   `hash.apply` becomes callable on the generator by the method's
    #     name, altering the definition in some customizable way.
    #   `hash.finalize` is always called just before sealing, and provides
    #     a final oportunity to make changes to the definition before
    #     it becomes immutable.
    #   `hash.seal` provides an opportunity to freeze any deeper objects
    #     before the definition itself is frozen.  The sealing method
    #     is only called if the apply function was called, or an initializer
    #     or finalizer function was provided.
    # There is no guarantee to the order that the `init`, `finalize` and
    # `seal` methods are called, so do not rely on any execution order.
    @method = (name, hash) ->
      if hash.init?
        initializers[name] = ->
          hash.init.call(@definition)
          @sealers[name] = true
      else delete initializers[name]
      
      if hash.apply?
        appliers[name] = ->
          if @isSealed
            throw new Error('cannot apply method; generator is sealed')
          hash.apply.apply(@definition, arguments)
          @sealers[name] = true
          return this
      else delete appliers[name]
      
      if hash.finalize?
        finalizers[name] = ->
          hash.finalize.call(@definition)
          @sealers[name] = true
      else delete finalizers[name]
      
      if hash.seal?
        sealers[name] = hash.seal
      else delete sealers[name]
      
      methods[name] = hash
    
    # Indicates if the factory is capable of a particular methods.
    # If the method `hash` is provided, it will check to see if it
    # matches the method, otherwise it will just check to see if
    # it has any method by that name.
    @hasMethod = (name, hash) ->
      return methods[name] is hash if hash?
      return methods[name]?

`export default Factory`