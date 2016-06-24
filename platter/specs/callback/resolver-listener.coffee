`import ResolverListener from 'platter/callback/resolver-listener'`
`import cbEvents from 'platter/callback/events'`
`import cbExceptions from 'platter/callback/exceptions'`
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

describe 'platter: callback, resolver-listener', ->
  
  noop = -> return
  
  describe 'construction', ->
  
    it 'should construct with arity 4', ->
      listener = new ResolverListener(cbEvents.begin, cbSolid, cbGround, noop)
      
      expect(listener.interactor1).toBe cbSolid
      expect(listener.interactor2).toBe cbGround
      expect(listener.events).toBe cbEvents.begin
      expect(listener.fn).toBe noop
    
    it 'should construct with arity 5', ->
      listener = new ResolverListener(cbEvents.begin, cbSolid, cbGround, {}, noop)
      
      expect(listener.interactor1).toBe cbSolid
      expect(listener.interactor2).toBe cbGround
      expect(listener.events).toBe cbEvents.begin
      expect(listener.fn).toBe noop
    
    it 'should set default options', ->
      listener = new ResolverListener(cbEvents.begin, cbSolid, cbGround, {}, noop)
      
      expect(listener.exception).toBe false
      expect(listener.precedence).toBe 0
    
    it 'should construct options from arrays of types', ->
      arr = [cbGround, cbSpikes]
      listener1 = new ResolverListener(cbEvents.begin, arr, cbSolid, {}, noop)
      listener2 = new ResolverListener(cbEvents.begin, cbSolid, arr, {}, noop)
      
      expect(listener1.interactor1.included).toBe(cbGround.value | cbSpikes.value)
      expect(listener2.interactor2.included).toBe(cbGround.value | cbSpikes.value)
    
    it 'should throw if no valid event flag is provided', ->
      fns = [
        -> new ResolverListener(0, cbSolid, cbGround, {}, noop)
        -> new ResolverListener(null, cbSolid, cbGround, {}, noop)
        -> new ResolverListener({}, cbSolid, cbGround, {}, noop)
        -> new ResolverListener((1<<30), cbSolid, cbGround, {}, noop)
      ]
      
      expect(fn).toThrow() for fn in fns
      return
  
  describe 'registration', ->
    listener = null
    a = { type: cbSolid }
    b = { type: cbGround }
    
    beforeEach ->
      listener = new ResolverListener(cbEvents.begin, cbSolid, cbGround, noop)
    
    afterEach ->
      listener.unregister()
      listener = null
  
    it 'should construct unregistered', ->
      expect(listener.registered).toBe false
      
    it 'should be matchable once registered', ->
      listener.register()
      
      expect(listener.registered).toBe true
      
      matches = ResolverListener.findMatches(a, b, cbEvents.begin, 0)
      expect(matches).toContain listener
    
    it 'should no longer be matchable once unregistered', ->
      listener.register().unregister()
      
      expect(listener.registered).toBe false
      
      matches = ResolverListener.findMatches(a, b, cbEvents.begin, 0)
      expect(matches).not.toContain listener
    
  describe 'matching and retrieval', ->
    
    playerHitOpt = new CallbackOptions([cbPlayer, cbFHitBox]).strict()
    playerDmgOpt = new CallbackOptions([cbPlayer, cbFDmgBox]).strict()
    friendDmgOpt = new CallbackOptions(cbFDmgBox).excluding(cbPlayer).strict()
    spikeOpt = new CallbackOptions([cbGround, cbSpikes]).strict()
    
    groundListener = platformListener = crushListener = teleportListener = null
    spikeListener = playerHitListener = friendlyHitListener = friendlyDmgListener = null
    
    beforeEach ->
      bog = cbEvents.begin | cbEvents.onGoing
      sh = { exception: cbExceptions.repeat }
      th = { exception: cbExceptions.teleport }
      ph = { precedence: 2 }
      
      groundListener = new ResolverListener(bog, cbSolid, cbGround, noop).register()
      crushListener = new ResolverListener(bog, cbSolid, cbGround, sh, noop).register()
      teleportListener = new ResolverListener(cbEvents.begin, cbSolid, cbGround, th, noop).register()
      platformListener = new ResolverListener(bog, cbSolid, cbGround, ph, noop).register()
      
      spikeListener = new ResolverListener(bog, spikeOpt, playerHitOpt, noop).register()
      playerHitListener = new ResolverListener(cbEvents.begin, playerDmgOpt, cbEHitBox, noop).register()
      friendlyHitListener = new ResolverListener(cbEvents.begin, friendDmgOpt, cbEHitBox, noop).register()
      friendlyDmgListener = new ResolverListener(cbEvents.begin, cbEDmgBox, cbFHitBox, noop).register()
    
    afterEach ->
      groundListener.unregister()
      crushListener.unregister()
      teleportListener.unregister()
      platformListener.unregister()
      
      spikeListener.unregister()
      playerHitListener.unregister()
      friendlyHitListener.unregister()
      friendlyDmgListener.unregister()
    
    it 'should retrieve only for the event type specified', ->
      a = { type: new CallbackMetatype([cbPlayer, cbFDmgBox]) }
      b = { type: cbEHitBox }
      
      match1 = ResolverListener.findMatches(a, b, cbEvents.begin)
      match2 = ResolverListener.findMatches(a, b, cbEvents.onGoing)
      
      expect(match1.length).toBe 1
      expect(match1).toContain playerHitListener
      
      expect(match2.length).toBe 0
    
    it 'should not retrieve listeners that handle an exception when none is specified', ->
      a = { type: cbSolid }
      b = { type: cbGround }
      
      matches = ResolverListener.findMatches(a, b, cbEvents.begin)
      
      expect(matches.length).toBe 2
      expect(matches).toContain groundListener
      expect(matches).toContain platformListener
    
    it 'should retrieve listeners that handle a specified exception and those that handle none', ->
      a = { type: cbSolid }
      b = { type: cbGround }
      
      matches = ResolverListener.findMatches(a, b, cbEvents.begin, cbExceptions.repeat)
      
      expect(matches.length).toBe 3
      expect(matches).toContain groundListener
      expect(matches).toContain platformListener
      expect(matches).toContain crushListener
      expect(matches).not.toContain teleportListener
    
    it 'should retrieve in descending precedence order', ->
      a = { type: cbSolid }
      b = { type: cbGround }
      
      matches = ResolverListener.findMatches(a, b, cbEvents.begin)
      
      expect(matches[0]).toBe platformListener
      expect(matches[1]).toBe groundListener
    
    it 'should retrieve with exceptions ordered first', ->
      a = { type: cbSolid }
      b = { type: cbGround }
      
      matches = ResolverListener.findMatches(a, b, cbEvents.begin, cbExceptions.repeat)
      
      expect(matches[0]).toBe crushListener
      expect(matches[1]).toBe platformListener
      expect(matches[2]).toBe groundListener