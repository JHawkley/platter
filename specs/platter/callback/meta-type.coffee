`import CallbackMetatype from 'platter/callback/meta-type'`
`import CallbackType from 'platter/callback/type'`

cbType1 = CallbackType.add('test-type-1')
cbType2 = CallbackType.add('test-type-2')
cbType3 = CallbackType.add('test-type-3')

describe 'platter: callbacks, meta-type', ->
  
  describe 'creation', ->
    
    it 'should be constructable empty', ->
      cbMeta = null
      fn = -> cbMeta = new CallbackMetatype()
      
      expect(fn).not.toThrow()
      expect(cbMeta?).toBe true
      expect(cbMeta.value).toBe 0x00000000
    
    it 'should be constructable with just a name', ->
      cbMeta = null
      fn = -> cbMeta = new CallbackMetatype('test-meta')
      
      expect(fn).not.toThrow()
      expect(cbMeta?).toBe true
      expect(cbMeta.name).toBe 'test-meta'
      expect(cbMeta.value).toBe 0x00000000
    
    it 'should be constructable with just a single type', ->
      cbMeta = null
      fn = -> cbMeta = new CallbackMetatype(cbType1)
      
      expect(fn).not.toThrow()
      expect(cbMeta?).toBe true
      expect(cbMeta.value).toBe cbType1.value
    
    it 'should be constructable with just an array of types', ->
      cbMeta = null
      fn = -> cbMeta = new CallbackMetatype([cbType1, cbType2, cbType3])
      sValue = cbType1.value | cbType2.value | cbType3.value
      
      expect(fn).not.toThrow()
      expect(cbMeta?).toBe true
      expect(cbMeta.value).toBe sValue
    
    it 'should be constructable with both a name and a single type', ->
      cbMeta = null
      fn = -> cbMeta = new CallbackMetatype('test-meta', cbType1)
      
      expect(fn).not.toThrow()
      expect(cbMeta?).toBe true
      expect(cbMeta.name).toBe 'test-meta'
      expect(cbMeta.value).toBe cbType1.value
    
    it 'should be constructable with both a name and an array of types', ->
      cbMeta = null
      fn = -> cbMeta = new CallbackMetatype('test-meta', [cbType1, cbType2, cbType3])
      sValue = cbType1.value | cbType2.value | cbType3.value
      
      expect(fn).not.toThrow()
      expect(cbMeta?).toBe true
      expect(cbMeta.name).toBe 'test-meta'
      expect(cbMeta.value).toBe sValue