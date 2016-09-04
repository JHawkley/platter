`import CallbackType from 'platter/callback/type'`
`import CallbackOptions from 'platter/callback/options'`

describe 'platter: callbacks, types', ->
  
  describe 'adding and getting', ->
    
    it 'should create a type', ->
      cbType = CallbackType.add('test-type-1')
      
      expect(cbType?).toBe true
      expect(cbType instanceof CallbackType).toBe true
    
    it 'should return the same instance if added twice', ->
      cbType1 = CallbackType.add('test-type-2')
      cbType2 = CallbackType.add('test-type-2')
      
      expect(cbType1).toBe cbType2
    
    it 'should be able to get by `CallbackType.get()`', ->
      cbType1 = CallbackType.add('test-type-3')
      cbType2 = CallbackType.get('test-type-3')
      
      expect(cbType1).toBe cbType2
  
  describe 'implementation', ->
    cbType1 = cbType2 = cbType3 = null
    
    beforeEach ->
      cbType1 = CallbackType.add('test-type-1')
      cbType2 = CallbackType.add('test-type-2')
      cbType3 = CallbackType.add('test-type-3')
    
    it 'should have a property `name`', ->
      expect(cbType1.name).toBe 'test-type-1'
    
    it 'should have a valid `value`', ->
      values = ((1 << n) for n in [0..31])
      expect(values.some (v) -> cbType1.value is v).toBe true
    
    it 'should implement the `CallbackOptions` interface', ->
      expect(cbType1.included).toBe cbType1.value
      expect(cbType1.excluded).toBe 0
      
      opt1 = cbType1.including(cbType2)
      
      expect(opt1 instanceof CallbackOptions).toBe true
      expect(opt1.included).toBe(cbType1.value | cbType2.value)
      expect(opt1.excluded).toBe 0
      
      opt2 = cbType1.excluding(cbType3)
      expect(opt2 instanceof CallbackOptions).toBe true
      expect(opt2.included).toBe cbType1.value
      expect(opt2.excluded).toBe cbType3.value
      
      expect(cbType1.test(cbType1)).toBe true
      expect(cbType1.test(cbType2)).toBe false
      
      opt3 = cbType1.including([cbType2, cbType3])
      expect(opt3.included).toBe(cbType1.value | cbType2.value | cbType3.value)
      expect(opt3.excluded).toBe 0
      
      opt4 = cbType1.excluding([cbType2, cbType3])
      expect(opt4.included).toBe(cbType1.value)
      expect(opt4.excluded).toBe(cbType2.value | cbType3.value)
  
  describe 'grouping', ->
    
    cbType1 = cbType2 = cbType3 = null
    
    beforeEach ->
      cbType1 = CallbackType.add('test-type-1')
      cbType2 = CallbackType.add('test-type-2')
      cbType3 = CallbackType.add('test-type-3')
    
    it 'should be able to create type groups', ->
      cbTypes = [ cbType1, cbType2, cbType3 ]
      
      sValue = 0
      sValue |= cbType.value for cbType in cbTypes
      
      cbSpecial = CallbackType.addToGroup('test-types', cbTypes[0])
      CallbackType.addToGroup('test-types', cbTypes[1])
      CallbackType.addToGroup('test-types', cbTypes[2])
      
      expect(cbSpecial instanceof CallbackType).toBe true
      expect(cbSpecial.value).toBe sValue
      expect(cbSpecial.name).toBe 'test-types'
  
  describe 'null special type', ->
    
    it 'should be defined', ->
      expect(CallbackType.get('null')?).toBe true
    
    it 'should still be a CallbackType', ->
      expect(CallbackType.get('null') instanceof CallbackType).toBe true
    
    it 'should have a value of 0x00000000', ->
      expect(CallbackType.get('null').value).toBe 0x00000000
    
    it 'should only match itself with `test()`', ->
      cbType1 = CallbackType.add('test-type-1')
      cbType2 = CallbackType.add('test-type-2')
      cbNull = CallbackType.get('null')
      
      expect(cbNull.test(cbType1)).toBe false
      expect(cbNull.test(cbType2)).toBe false
      expect(cbNull.test(cbNull)).toBe true
  
  describe 'all special type', ->
    
    it 'should be defined', ->
      expect(CallbackType.get('all')?).toBe true
    
    it 'should still be a CallbackType', ->
      expect(CallbackType.get('all') instanceof CallbackType).toBe true
    
    it 'should have a value of 0xFFFFFFFF (or -1)', ->
      expect(CallbackType.get('all').value).toBe ~0x00000000