`import Factory from '../factory/base'`
`import Proxy from './proxy-base'`
`import { point as support } from '../geom/_support'`
`import Matrix from '../math/matrix'`
`import { set, setXY } from '../math/vector-math'`

{ min, max } = Math

# Working matrix.
wm = new Matrix()

proxyPointFactory = new Factory class extends Proxy
  
  transform: ->
    { proxied, oldPosition: oPos, syncPosition: sPos } = this
    { x, y, parent: { flipX, flipY } } = proxied
    
    setXY(oPos, (if flipX then -x else x), (if flipY then -y else y))
    wm.reset()
    proxied.iterateUpToRoot (anc) ->
      # Don't apply the world's translation.
      wm.translate(anc.x, anc.y) if anc.parent?
    wm.applyToPoint(oPos)
    
    set(sPos, oPos)
  
  support: (out, v) -> support(out, this, v)
  
  toRect: (out, synced = false) ->
    if synced
      { x, y } = @syncPosition
      out.setProps(x, y, 0, 0)
    else
      nodes = @delta.nodes
      
      if nodes.length > 0
        if nodes[0].pos is 0.0
          minX = minY = Number.POSITIVE_INFINITY
          maxX = maxY = Number.NEGATIVE_INFINITY
        else
          minX = maxX = minY = maxY = 0
        
        for node in nodes
          { x, y } = node.value
          minX = min(minX, x)
          maxX = max(maxX, x)
          minY = min(minY, y)
          maxY = max(maxY, y)
        
        { x, y } = @oldPosition
        out.setProps(minX + x, minY + y, maxX - minX, maxY - minY)
      else
        { x, y } = @oldPosition
        out.setProps(x, y, 0, 0)
    
    return out
  
`export default proxyPointFactory`