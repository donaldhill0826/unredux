import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"

export default (sources, key) => {
  let intents = {
    // unsubscribed on state unsubscribe which happens on willUnmount
    inc$: sources.DOM.fromKey("inc").listen("click"),
    dec$: sources.DOM.fromKey("dec").listen("click"),
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
    D.withLocalStoragePersistence({key}),
  )(O.merge(
    D.init(0),
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  )).$

  let Component = F.connect(
    {counter: state$},
    ({counter}) =>
      <div>
        Page 2: {counter} <button data-key="inc">+1</button> <button data-key="dec">-1</button>
        <p><i>Local Storage persistence</i></p>
      </div>,
    {
      componentWillMount(...args) {
        console.log("Page2 will mount!")
      },
      componentWillUnmount(...args) {
        console.log("Page2 will unmount!")
      }
    }
  )

  return {Component}
}
