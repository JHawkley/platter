debug =
  log: -> console.log(arguments...)
  warn: -> (console.warn ? console.log)(arguments...)
  error: -> (console.error ? console.log)(arguments...)
  assert: (msg, test) -> throw new Error(msg) unless test

`export default debug`