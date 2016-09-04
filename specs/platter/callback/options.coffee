`import CallbackOptions from 'platter/callback/options'`
`import CallbackType from 'platter/callback/type'`
`import CallbackMetatype from 'platter/callback/meta-type'`

cbType1 = CallbackType.add('test-type-1')
cbType2 = CallbackType.add('test-type-2')
cbType3 = CallbackType.add('test-type-3')
cbGroup = do ->
  CallbackType.addToGroup('option-types', cbType2)
  return CallbackType.addToGroup('option-types', cbType3)
cbMeta1 = new CallbackMetatype([cbType1, cbType2])
cbMeta2 = new CallbackMetatype([cbType2, cbType3])
cbMeta3 = new CallbackMetatype([cbType1, cbType3])
cbNull = CallbackType.get('null')

describe 'platter: callbacks, options', ->
  
  describe 'creation', ->
  
    it 'should be constructable empty', ->
      cbOptions = null
      fn = -> cbOptions = new CallbackOptions()
      
      expect(fn).not.toThrow()
      expect(cbOptions?).toBe true
      expect(cbOptions.included).toBe 0
      expect(cbOptions.excluded).toBe 0
    
    it 'should be constructable with a single cbType', ->
      cbOptions = null
      fn = -> cbOptions = new CallbackOptions(cbType1)
      
      expect(fn).not.toThrow()
      expect(cbOptions?).toBe true
      expect(cbOptions.included).toBe cbType1.value
      expect(cbOptions.excluded).toBe 0
    
    it 'should be constructable with an array of cbTypes', ->
      cbOptions = null
      fn = -> cbOptions = new CallbackOptions([cbType1, cbType2])
      
      expect(fn).not.toThrow()
      expect(cbOptions?).toBe true
      expect(cbOptions.included).toBe(cbType1.value | cbType2.value)
      expect(cbOptions.excluded).toBe 0
  
  describe 'inclusion', ->
    
    it 'should be capable of including a new type', ->
      cbOptions = new CallbackOptions(cbType1)
      
      expect(cbOptions.included).toBe cbType1.value
      expect(cbOptions.excluded).toBe 0
      
      cbOptions.including(cbType2)
      
      expect(cbOptions.included).toBe(cbType1.value | cbType2.value)
      expect(cbOptions.excluded).toBe 0
    
    it 'should be capable of including an array of types', ->
      cbOptions = new CallbackOptions(cbType1)
      
      expect(cbOptions.included).toBe cbType1.value
      expect(cbOptions.excluded).toBe 0
      
      cbOptions.including([cbType2, cbType3])
      
      expect(cbOptions.included).toBe(cbType1.value | cbType2.value | cbType3.value )
      expect(cbOptions.excluded).toBe 0
    
    it 'should be capable of including a meta-type', ->
      cbOptions = new CallbackOptions(cbMeta1)
      expect(cbOptions.included).toBe cbMeta1.value
    
    it 'should be capable of including a type group', ->
      cbOptions = new CallbackOptions(cbGroup)
      expect(cbOptions.included).toBe cbGroup.value
  
  describe 'exclusion', ->
    
    it 'should be capable of excluding a type', ->
      cbOptions = new CallbackOptions(cbType1)
      
      expect(cbOptions.included).toBe cbType1.value
      expect(cbOptions.excluded).toBe 0
      
      cbOptions.excluding(cbType2)
      
      expect(cbOptions.included).toBe cbType1.value
      expect(cbOptions.excluded).toBe cbType2.value
    
    it 'should be capable of excluding an array of types', ->
      cbOptions = new CallbackOptions(cbType1)
      
      expect(cbOptions.included).toBe cbType1.value
      expect(cbOptions.excluded).toBe 0
      
      cbOptions.excluding([cbType2, cbType3])
      
      expect(cbOptions.included).toBe cbType1.value
      expect(cbOptions.excluded).toBe(cbType2.value | cbType3.value)
    
    it 'should be capable of excluding a meta-type', ->
      cbOptions = new CallbackOptions(cbType1).excluding(cbMeta2)
      expect(cbOptions.excluded).toBe cbMeta2.value
    
    it 'should be capable of excluding a type group', ->
      cbOptions = new CallbackOptions(cbType1).excluding(cbGroup)
      expect(cbOptions.excluded).toBe cbGroup.value
  
  describe 'testing', ->
    
    it 'should always fail if nothing included', ->
      cbOptions = new CallbackOptions()
      
      expect(cbOptions.test(cbType1)).toBe false
      expect(cbOptions.test(cbType2)).toBe false
      expect(cbOptions.test(cbType3)).toBe false
      expect(cbOptions.test(cbNull)).toBe false
    
    it 'should match included types', ->
      cbOptions = new CallbackOptions([cbType1, cbType2])
      
      expect(cbOptions.test(cbType1)).toBe true
      expect(cbOptions.test(cbType2)).toBe true
      expect(cbOptions.test(cbType3)).toBe false
      expect(cbOptions.test(cbNull)).toBe false
    
    describe 'against meta-types/groups', ->
    
      it 'should match when it includes an included type', ->
        cbOptions = new CallbackOptions([cbType2])
        
        expect(cbOptions.test(cbMeta1)).toBe true
        expect(cbOptions.test(cbMeta2)).toBe true
        expect(cbOptions.test(cbMeta3)).toBe false
      
      it 'should not match a meta-type/group that has an excluded type', ->
        cbOptions = new CallbackOptions([cbType1, cbType2]).excluding cbType3
        
        expect(cbOptions.test(cbMeta1)).toBe true
        expect(cbOptions.test(cbMeta2)).toBe false
        expect(cbOptions.test(cbMeta3)).toBe false
  
  describe 'strict mode', ->
    
    it 'should be able to be enabled', ->
      cbOptions = new CallbackOptions([cbType1, cbType2]).excluding(cbType3)
      
      expect(cbOptions.isStrict).toBe false
      
      fn = -> cbOptions.strict()
      
      expect(fn).not.toThrow()
      expect(cbOptions.isStrict).toBe true
    
    it 'should match inclusive membership strictly', ->
      cbOptions = new CallbackOptions([cbType1, cbType2]).excluding(cbType3).strict()
      
      expect(cbOptions.test(cbMeta1)).toBe true
      expect(cbOptions.test(cbMeta2)).toBe false
      expect(cbOptions.test(cbMeta3)).toBe false
      
      expect(cbOptions.test(cbType1)).toBe false
      expect(cbOptions.test(cbType2)).toBe false
      expect(cbOptions.test(cbType3)).toBe false
  
  describe 'sealing and immutability', ->
    
    it 'should be able to be enabled', ->
      cbOptions = new CallbackOptions([cbType1, cbType2])
      
      expect(cbOptions.isSealed).toBe false
      
      fn = -> cbOptions.seal()
      
      expect(fn).not.toThrow()
      expect(cbOptions.isSealed).toBe true
    
    it 'should prevent further changes to the CallbackOptions', ->
      cbOptions = new CallbackOptions(cbType1).seal()
      
      fn1 = -> cbOptions.including cbType2
      fn2 = -> cbOptions.excluding cbType3
      fn3 = -> cbOptions.strict()
      
      expect(fn1).toThrow()
      expect(fn2).toThrow()
      expect(fn3).toThrow()