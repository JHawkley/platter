`import { isArray } from '../utils/array'`

class CallbackOptions

  Object.defineProperty @prototype, 'included',
    get: -> @_data.included
  
  Object.defineProperty @prototype, 'excluded',
    get: -> @_data.excluded
  
  Object.defineProperty @prototype, 'isStrict',
    get: -> @_data.strict
  
  Object.defineProperty @prototype, 'isSealed',
    get: -> @_data.sealed
  
  constructor: (includedTypes) ->
    @_data = { included: 0, excluded: 0, strict: false, sealed: false }
    @including(includedTypes) if includedTypes?
    return
  
  including: (cbTypes) ->
    _data = @_data
    cbTypes = if isArray(cbTypes) then cbTypes[..] else [cbTypes]
    _data.included |= cbType.value for cbType in cbTypes
    return this
  
  excluding: (cbTypes) ->
    _data = @_data
    cbTypes = if isArray(cbTypes) then cbTypes[..] else [cbTypes]
    _data.excluded |= cbType.value for cbType in cbTypes
    return this
  
  strict: -> @_data.strict = true; return this
  
  test: (cbType) ->
    _data = @_data
    value = cbType.value
    return false if _data.excluded & value
    return _data.included is value if _data.strict
    return !!(_data.included & value)
  
  seal: ->
    _data = @_data
    _data.sealed = true
    Object.freeze(_data)
    return this

`export default CallbackOptions`