events =
  none: 0
  begin: (1<<0)
  onGoing: (1<<1)
  end: (1<<2)

events.all = events.begin | events.onGoing | events.end

`export default events`