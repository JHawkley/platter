`import PreListener from 'platter/callback/pre-listener'`
`import cbEvents from 'platter/callback/events'`
`import CallbackType from 'platter/callback/type'`
`import CallbackOptions from 'platter/callback/options'`
`import CallbackMetatype from 'platter/callback/meta-type'`

# Our totally legitimate game-like object ypes.
cbSolid = CallbackType.add('test-type-1')
cbGround = CallbackType.add('test-type-2')
cbSpikes = CallbackType.add('test-type-3')
cbFDmgBox = CallbackType.add('test-type-4')
cbEDmgBox = CallbackType.add('test-type-5')
cbFHitBox = CallbackType.add('test-type-6')
cbEHitBox = CallbackType.add('test-type-7')
cbPlayer = CallbackType.add('test-type-8')

describe 'platter: callback, pre-listener', ->
  
  noop = -> return
  
  describe 'construction', ->
  
    it 'should construct with arity 4', ->
      listener = new PreListener(cbEvents.begin, cbSolid, cbGround, noop)
      
      expect(listener.interactor1).toBe cbSolid
      expect(listener.interactor2).toBe cbGround
      expect(listener.events).toBe cbEvents.begin
      expect(listener.fn).toBe noop
    
    it 'should construct with arity 5', ->
      listener = new PreListener(cbEvents.begin, cbSolid, cbGround, {}, noop)
      
      expect(listener.interactor1).toBe cbSolid
      expect(listener.interactor2).toBe cbGround
      expect(listener.events).toBe cbEvents.begin
      expect(listener.fn).toBe noop
    
    it 'should set default options', ->
      listener = new PreListener(cbEvents.begin, cbSolid, cbGround, {}, noop)
      
      expect(listener.precedence).toBe 0
    
    it 'should construct options from arrays of types', ->
      arr = [cbGround, cbSpikes]
      listener1 = new PreListener(cbEvents.begin, arr, cbSolid, {}, noop)
      listener2 = new PreListener(cbEvents.begin, cbSolid, arr, {}, noop)
      
      expect(listener1.interactor1.included).toBe(cbGround.value | cbSpikes.value)
      expect(listener2.interactor2.included).toBe(cbGround.value | cbSpikes.value)
    
    it 'should throw if no valid event flag is provided', ->
      fns = [
        -> new PreListener(0, cbSolid, cbGround, {}, noop)
        -> new PreListener(null, cbSolid, cbGround, {}, noop)
        -> new PreListener({}, cbSolid, cbGround, {}, noop)
        -> new PreListener((1<<30), cbSolid, cbGround, {}, noop)
      ]
      
      expect(fn).toThrow() for fn in fns
      return
  
  describe 'registration', ->
    listener = null
    a = { type: cbSolid }
    b = { type: cbGround }
    
    beforeEach ->
      listener = new PreListener(cbEvents.begin, cbSolid, cbGround, noop)
    
    afterEach ->
      listener.unregister()
      listener = null
  
    it 'should construct unregistered', ->
      expect(listener.registered).toBe false
      
    it 'should be matchable once registered', ->
      listener.register()
      
      expect(listener.registered).toBe true
      
      matches = PreListener.findMatches(a, b, cbEvents.begin, 0)
      expect(matches).toContain listener
    
    it 'should no longer be matchable once unregistered', ->
      listener.register().unregister()
      
      expect(listener.registered).toBe false
      
      matches = PreListener.findMatches(a, b, cbEvents.begin, 0)
      expect(matches).not.toContain listener
    
  describe 'matching and retrieval', ->
    
    playerHitOpt = new CallbackOptions([cbPlayer, cbFHitBox]).strict()
    playerDmgOpt = new CallbackOptions([cbPlayer, cbFDmgBox]).strict()
    friendDmgOpt = new CallbackOptions(cbFDmgBox).excluding(cbPlayer).strict()
    spikeOpt = new CallbackOptions([cbGround, cbSpikes]).strict()
    
    groundListener = platformListener = null
    spikeListener = playerHitListener = friendlyHitListener = friendlyDmgListener = null
    
    beforeEach ->
      bog = cbEvents.begin | cbEvents.onGoing
      ph = { precedence: 2 }
      
      groundListener = new PreListener(bog, cbSolid, cbGround, noop).register()
      platformListener = new PreListener(bog, cbSolid, cbGround, ph, noop).register()
      
      spikeListener = new PreListener(bog, spikeOpt, playerHitOpt, noop).register()
      playerHitListener = new PreListener(cbEvents.begin, playerDmgOpt, cbEHitBox, noop).register()
      friendlyHitListener = new PreListener(cbEvents.begin, friendDmgOpt, cbEHitBox, noop).register()
      friendlyDmgListener = new PreListener(cbEvents.begin, cbEDmgBox, cbFHitBox, noop).register()
    
    afterEach ->
      groundListener.unregister()
      platformListener.unregister()
      
      spikeListener.unregister()
      playerHitListener.unregister()
      friendlyHitListener.unregister()
      friendlyDmgListener.unregister()
    
    it 'should retrieve only for the event type specified', ->
      a = { type: new CallbackMetatype([cbPlayer, cbFDmgBox]) }
      b = { type: cbEHitBox }
      
      match1 = PreListener.findMatches(a, b, cbEvents.begin)
      match2 = PreListener.findMatches(a, b, cbEvents.onGoing)
      
      expect(match1.length).toBe 1
      expect(match1).toContain playerHitListener
      
      expect(match2.length).toBe 0
    
    it 'should retrieve in descending precedence order', ->
      a = { type: cbSolid }
      b = { type: cbGround }
      
      matches = PreListener.findMatches(a, b, cbEvents.begin)
      
      expect(matches[0]).toBe platformListener
      expect(matches[1]).toBe groundListener