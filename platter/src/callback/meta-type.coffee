`import CallbackType from './type'`
`import { isArray } from '../utils/array'`

anonCounter = 0

zeroes = '00000000000000000000000000000000'

procType = (cbType, data) ->
  if cbType.contributors?
    procType(subType, data) for subType in cbType.contributors
  else
    arr = data.contributors
    value = cbType.value
    if value isnt 0 and not (value & data.value)
      arr.push cbType
      data.value |= value
  return

class CallbackMetatype extends CallbackType

  Object.defineProperty @prototype, 'contributors',
    get: -> @_data.contributors

  constructor: (name, types) ->
    switch arguments.length
      when 0
        name = null
        types = []
      when 1 then switch
        when isArray(name)
          types = name
          name = null
        when name instanceof CallbackType
          types = [name]
          name = null
        else
          types = []
      when 2
        types = [types] if types instanceof CallbackType
    
    @_data = _data = { name: null, value: 0x00000000, contributors: [] }
    
    procType(type, _data) for type in types
    
    if not name?
      vStr = (_data.value >>> 0).toString(2)
      name = "anonymous (#{zeroes.substr(vStr.length) + vStr})"
    _data.name = name
    
    Object.freeze(_data.contributors)
    Object.freeze(_data)
    return

`export default CallbackMetatype`