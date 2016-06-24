`import Vector from '../math/vector'`
`import { set, add } from '../math/vector-math'`
`import { kinematic as tKinematic } from '../space/_type'`

class Proxy

  @init: (instance, proxied) ->
    instance.proxied = proxied
  
  Object.defineProperty @prototype, 'isKinematic',
    get: -> tKinematic.test(@proxied.parent.type)
  
  Object.defineProperty @prototype, 'x',
    get: -> @syncPosition.x
  
  Object.defineProperty @prototype, 'y',
    get: -> @syncPosition.y
  
  Object.defineProperty @prototype, 'delta',
    get: -> @proxied.parent.delta
  
  Object.defineProperty @prototype, 'parent',
    get: -> @proxied.parent
  
  Object.defineProperty @prototype, 'id',
    get: -> @proxied.id
  
  constructor: ->
    # That geometry which is being proxied.
    @proxied = null
    # The position as it was at the start of the timestep.
    @oldPosition = Vector.create()
    # The position as it is, syncronized with a particular time.
    @syncPosition = Vector.create()
    # A list of collisions affecting this proxy.
    @collisions = {}
    # The collision object last used in a collision resolution.
    # A proxy cannot interact with the same object twice in a row.
    # It must interact with another object first.
    @lastCollision = null
    # The TOI Island the proxy is currently assigned to.
    @island = null
  
  # Transforms the proxied geometry into world-space, in the position
  # it was at the start of the time step, applying any flips as it does.
  # This function is called once at the start of the time step.
  #
  # The transformed shape is cached and reused throughout the step,
  # simply offset from its starting position as sub-steps are processed.
  transform: -> throw new Error('not implemented')
  
  # Syncronizes the proxied object with a `time` of the sub-step.
  # This `time` is normalized between 0.0 and 1.0, where 0.0 is the
  # start of the time step and 1.0 is the end.
  #
  # This function will be called each time the object will be worked
  # with, usually during a collision during a sub-step.
  sync: (time) ->
    offset = @delta.valueAt(Vector.create(), time)
    add(@syncPosition, @oldPosition, offset)
    offset.release()
  
  # The support function for this object.  Should provide a value
  # that is in sync.
  support: (v) -> throw new Error('not implemented')
  
  # Returns the center of the geometry.  Will always be the synchronized
  # position.
  centerOf: (out) ->
    @proxied.centerOf(out)
    add(out, @syncPosition)
    return out
  
  addCollision: (other) ->
  
  getCollision: (other) -> @collisions[other.id]
    
  remCollision: (other) ->
    coll = @collisions[other.id]
    other.remCollision(this)
    delete @collisions[other.id]
    @lastCollision = null if @lastCollision is coll
    coll.release()
    return
  
  destroy: ->
    for k, coll of @collisions
      @remCollision(coll.getById(k))
    @lastCollision = null
    @proxied = null
  
  # Obtains the proxied object's rectangle, transormed to world space.
  # If `synced` is false, returns a rectangle that contains the shape
  # swept over its full delta.
  toRect: (out, synced = false) -> throw new Error('not implemented')
  
  toString: -> "Proxied::#{@proxied.toString()}"

`export default Proxy`