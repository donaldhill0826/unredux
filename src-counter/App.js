import R from "ramda"
import {Observable} from "rxjs/Observable"
import {Subject} from "rxjs/Subject"
import {ReplaySubject} from "rxjs/ReplaySubject"

// Import RxJS Observable functions
import "rxjs/add/observable/combineLatest"
import "rxjs/add/observable/merge"

// Import RxJS Observable methods
import "rxjs/add/operator/distinctUntilChanged"
import "rxjs/add/operator/map"
import "rxjs/add/operator/scan"
import "rxjs/add/operator/shareReplay"

import React, {Component} from "react"

import connect from "./connect"

// Helpers
let isOdd = (d) => d % 2

// App =============================================================================================
let stateCycle = new ReplaySubject(1)

// User intents
let intents = {
  increment: new Subject(),
  decrement: new Subject(),
  incrementIfOdd: new Subject(),
}

// State actions
let actions = {
  increment: Observable.merge(
    intents.increment,
    stateCycle.sample(intents.incrementIfOdd).filter(state => isOdd(state.counter))
  )
    .map(() => (state) => R.assoc("counter", state.counter + 1, state)),
  decrement: intents.decrement
    .map(() => (state) => R.assoc("counter", state.counter - 1, state)),
}

let initialState = {counter: 0}

let state = Observable.merge(
  actions.increment,
  actions.decrement,
)
 .startWith(initialState)
 .scan((state, fn) => fn(state))
 .do(state => {
   console.log("state spy:", state)
   stateCycle.next(state)
 })
 .distinctUntilChanged()
 .shareReplay(1)

export default connect(
  {counter: state.pluck("counter")},
  (props) =>
    <div className={props.className}>
      <p>
        Clicked: <span id="value">{props.counter}</span> times
        <button id="increment" onClick={() => intents.increment.next()}>+</button>
        <button id="decrement" onClick={() => intents.decrement.next()}>-</button>
        <button id="incrementIfOdd" onClick={() => intents.incrementIfOdd.next()}>Increment if odd</button>
        <button id="incrementAsync" onClick={() => {
          setTimeout(() => intents.increment.next(), 500)
        }}>Increment async</button>
      </p>
    </div>
)
