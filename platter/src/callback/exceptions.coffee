exceptions =
  # Default falue for when no exception is applicable.
  none: false
  
  # Caused when one object is moved into another object outside
  # the engine.  It may have been moved by the game or simply
  # spawned right on top of another entity when created.
  teleport: 'teleport'
  
  # Caused when a pair of entities collide more than once during
  # a time step.  This usually indicates a complex interaction,
  # and therefore necessitates a more aggressive solver.
  repeat: 'repeat'

`export default exceptions`