root = global ? window

escape = (str) -> str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')

root.toStringHelper = (head, tail) ->
  head = escape(head)
  tail = escape(tail)
  return new RegExp(head + '\\d+' + tail)