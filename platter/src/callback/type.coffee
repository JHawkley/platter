`import CallbackOptions from './options'`
`import { isArray } from '../utils/array'`

types = {}
curTypeShift = 0

class CallbackType

  @get: (name) -> types[name] ? throw new Error('no such type or group exists')
  @add: (name) ->
      return types[name] if types[name]?
      value = 1 << (curTypeShift++)
      throw new Error('too many callback types') if curTypeShift > 31
      return new CallbackUnit(name, value)
  @addToGroup: (name, cbType) ->
    cbGroup = types[name]
    if cbGroup?
      cbGroup.add cbType
    else
      cbGroup = types[name] = new CallbackGroup(name, cbType)
    return cbGroup

  Object.defineProperty @prototype, 'name',
    get: -> @_data.name
  
  Object.defineProperty @prototype, 'value',
    get: -> @_data.value
  
  Object.defineProperty @prototype, 'included',
    get: -> @_data.value
  
  Object.defineProperty @prototype, 'excluded',
    value: 0
  
  constructor: ->
    throw new Error('cannot be instantiated; use `CallbackType.add()` instead')
  
  including: (cbTypes) ->
    cbTypes = if isArray(cbTypes) then cbTypes[..] else [cbTypes]
    cbTypes.push(this)
    return new CallbackOptions(cbTypes)
  
  excluding: (cbTypes) ->
    cbTypes = if isArray(cbTypes) then cbTypes[..] else [cbTypes]
    return new CallbackOptions(this).excluding(cbTypes)
  
  strict: ->
    throw new Error('CallbackType is immutable; convert to a CallbackOptions first')
  
  test: (cbType) -> !!(@value & cbType.value)
  
  # CallbackType is already immutable.  Do nothing.
  seal: -> return

class CallbackUnit extends CallbackType
  
  constructor: (name, value) ->
    @_data = { name, value }
    Object.freeze(@_data)
    
    types[name] = this
    return

# Singleton 'null' type.
new class CallbackNull extends CallbackType
  
  constructor: ->
    name = 'null'
    @_data = { name, value: 0x00000000 }
    Object.freeze(@_data)
    
    types[name] = this
    return
  
  test: (cbType) -> @value is cbType.value

# Singleton 'all' type.
new class CallbackAll extends CallbackType
  
  constructor: ->
    name = 'all'
    @_data = { name, value: ~0x00000000 }
    Object.freeze(@_data)
    
    types[name] = this
    return

class CallbackGroup extends CallbackType

  Object.defineProperty @prototype, 'contributors',
    get: -> @_data.contributors
  
  constructor: (name, cbType) ->
    @_data = { name, value: 0x00000000, contributors: [] }
    @add(cbType)
    
    throw new Error('group has no valid contributors') if @_data.length is 0
    
    types[name] = this
    return
  
  add: (cbType) ->
    if cbType.contributors?
      @add(subType) for subType in cbType.contributors
    else if cbType.value isnt 0
      contributors = @_data.contributors
      i = contributors.indexOf cbType
      if i is -1
        contributors.push cbType
        @_data.value |= cbType.value

`export default CallbackType`