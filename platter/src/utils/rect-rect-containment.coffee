# Test if `rect` is fully contained within `bounds`.
RectRectContainment = (rect, bounds) ->
  return (
    rect.x >= bounds.x and
    rect.y >= bounds.y and
    rect.x + rect.width <= bounds.x + bounds.width and
    rect.y + rect.height <= bounds.y + bounds.height
  )
  
`export default RectRectContainment`