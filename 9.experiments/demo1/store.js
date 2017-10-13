let {mergeObj} = require("./utils")

// type Noop = (x) -> ()
// type Actions = Object (Observable (State -> State)

// (State, Actions, Noop) -> Observable State
export let store = (seed, actions, mapFn=R.id) => {
  return mergeObj(actions)
   .startWith(seed)
   .scan((state, fn) => {
      if (typeof fn != "function") {
        throw Error(`invalid fn ${fn} dispatched`)
      } else {
        return fn(state)
      }
   })
   .throttleTime(10) // RxJS throttle is half-broken a.t.m. (https://github.com/ReactiveX/rxjs/search?q=throttle&type=Issues)
   .map(mapFn)
   .distinctUntilChanged(R.equals)
   .shareReplay(1)
}

// (State, Actions, Actions, Number, Noop) -> Observable State
export let historyStore = (seed, stateActions, historyActions, historyLength, mapFn) => {
  stateActions = R.values(stateActions)     // converts objects, leaves arrays untouched
  historyActions = R.values(historyActions) // ...

  let normalizeLog = (log) =>
    R.takeLast(historyLength, [...R.repeat(null, historyLength), ...log])

  let normalizeI = (i) =>
    (i > historyLength - 1 ? historyLength - 1 : i)

  seed = {
    log: normalizeLog([seed]), // [null, null, <state>]
    i: historyLength - 1,              //  0     1     2!
  }

  stateActions = stateActions.map(channel => channel.map(fn => hs => {
    if (hs.i < historyLength - 1) {
      hs = R.merge(hs, {
        log: normalizeLog(R.slice(0, hs.i + 1, hs.log)),
        i: historyLength - 1,
      })
    }
    return R.setL(["log"], tailAppend(fn(hs.log[hs.i]), hs.log), hs)
  }))

  return store(seed, stateActions.concat(historyActions), state => {
    mapFn(state)
    return state.log[state.i]
  })
}

// (Observable State, (State -> State)) -> Observable State
export let derive = (state, deriveFn) => {
  return state
    .map(deriveFn)
    .distinctUntilChanged()
    .shareReplay(1)
}

let tailAppend = R.curry((x, xs) => {
  return R.append(x, R.tail(xs))
})

/*
Normal case
  log = [null, null, {a}]
  i = 2

  1) after change (both setL)
  log = [null, null, {a}, {b}]
  i = 3

  2) after normalization (both overL)
  log = [null, {a}, {b}]
  i = 2

Shifted case
  log = [null, {a}, {b}]
  i = 1

  1) after change (both setL)
  log = [null, {a}, {c}]
  i = 2

  2) after normalization (both overL)
  log = [null, {a}, {c}]
  i = 2
*/
