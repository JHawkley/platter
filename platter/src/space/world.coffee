`import Factory from '../factory/base'`
`import Group from './group'`
`import { methods as nodeMethods } from './node'`
`import { methods as groupMethods } from './group'`
`import { group as tGroup } from './_type'`
`import { world as typeGroup } from './_type'`
`import config from '../config'`
`import { iterateOn } from '../utils/es6'`
`import { rectRectIntersection } from '../utils/rect-rect-intersection'`
`import Rect from '../math/rect'`

`import PreListener from '../callback/pre-listener'`
`import TIsland from '../phys/toi-island'`

buffer = []
aRect = Rect.create()
bRect = Rect.create()

# A reused object that tracks the state of the current step.
stepProgress = {
  # The following are the world's clock, in milliseconds.
  startTime: 0      # Start time of the step.
  endTime: 0        # End time of the step.
  stepLength: 0     # Time to lapse during the step.
  # The following detail a linear progression of the step, from 0 to 1,
  # where 0 is `startTime` and 1 is `endTime`.
  stepProgress: 0   # Progress toward the end of the step.
  subStepEnd: 0     # The predicted end of the current sub-step.
}

worldFactory = new Factory class extends Group.ctor

  @init: (instance) ->
    instance.time = 0
    instance.spatialMap = config.broadphaseClass.create(this)

  Object.defineProperty @prototype, 'x',
    get: -> @_data.x
  
  Object.defineProperty @prototype, 'y',
    get: -> @_data.y
    
  Object.defineProperty @prototype, 'width',
    get: -> @_data.width
  
  Object.defineProperty @prototype, 'height',
    get: -> @_data.height
  
  constructor: ->
    super()
    @spatialMap = null
  
  destroy: ->
    super()
    @spatialMap.release()
    @spatialMap = null
  
  step: (timeLapsed) ->
    stepProgress.startTime = @time
    stepProgress.endTime = @time + timeLapsed
    stepProgress.stepLength = timeLapsed
    stepProgress.stepProgress = 0
    stepProgress.subStepEnd = 1
    
    while stepProgress.stepProgress < 1
      islands = @broadphase(stepProgress)
      break unless islands?
    
    @time = stepProgress.endTime
  
  broadphase: (prog) ->
    eTime = prog.subStepEnd
    cTime = prog.stepProgress
    headIsland = null
    @spatialMap.clear()
    
    # First, process and insert the non-kinematics.
    # Since non-kinematics can't collide with other non-kinematics,
    # there is no reason to do more complicated processing.
    iterateOn this, (a) =>
      px = a.proxy
      TIsland.releaseList(px.island) if px.island?
      delta = px.delta
      for node in delta.nodes when node.pos >= cTime
        eTime = node.pos if node.pos < eTime
        break
      if px.isKinematic then buffer.push(px) else @spatialMap.insert(px)
      return
      
    # Now, process the non-kinematics.  This is where collisions can occur.
    for a in buffer
      for b in @spatialMap.retrieve(a)
        # Cannot collide if the parents are the same.
        continue if a.parent is b.parent
        # No need if they're already part of the same island.
        continue if a.island is b.island
        # No need if there's no chance of overlap at all during this step.
        continue unless rectRectIntersection(a.toRect(aRect), b.toRect(bRect))
        aIs = a.island?; bIs = b.island?
        switch
          when not (aIs or bIs)
            newIsland = TIsland.create(a, b)
            if headIsland?
              headIsland.prev = newIsland
              newIsland.next = headIsland
            headIsland = newIsland
          when aIs and not bIs
            a.island.add(b)
          when bIs and not aIs
            b.island.add(a)
          else
            a.island.absorb(b.island)
    buffer.length = 0
    
    prog.subStepEnd = eTime
    return headIsland
  
  narrowphase: (islandList, events) ->
    iterateOn islandList, (island) ->
  
  wasAdoptedBy: -> throw new Error('worlds must remain a root node')
  
  toRect: (out) -> out.set(this); return out
  
  contentAsRect: (out) -> Group.ctor::toRect.call(this, out); return out
  
  toString: ->
    bounds = "{x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height}}"
    return "Platter.space.World##{@id}(#{bounds})"

methods =
  # Sets the filter to specifically allow only groups.
  filter:
    init: -> @filter = { included: [tGroup], excluded: [] }
    seal: -> groupMethods.filter.seal.call(this)
  # Sets the position of the world-space.
  position:
    init: -> @x = 0; @y = 0
    apply: (@x, @y) -> return
  # Sets the dimensions, width and height, of the world space.
  dimensions:
    apply: (@width, @height) -> return
    finalize: ->
      if not (@width? and @height?) or @width <= 0 or @height <= 0
        throw new Error('both dimensions must be provided')
  # Sets the width of the world space.
  width:
    apply: (@width) -> return
  # Sets the height of the world space.
  height:
    apply: (@height) -> return
  # Provides the node type.
  typeGroup:
    finalize: ->
      groupMethods.typeGroup.finalize.call(this)
      @type.push typeGroup

# Technically, this blocks all of the group methods,
# but in the future it may not.
for k, v of nodeMethods
  worldFactory.method(k, v)
for k, v of groupMethods when k not in ['filter', 'include', 'exclude', 'typeGroup']
  worldFactory.method(k, v)
for k, v of methods
  worldFactory.method(k, v)

`export { methods }`
`export default worldFactory`