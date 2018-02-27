import * as R from "@paqmind/ramda"
import A from "axios"
import {connect, derive} from "framework"
import K from "kefir"
import React from "react"
import * as B from "../blueprints"
import UserDetail from "./UserDetail"

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["users", params.id]
  let loadingLens = ["_loading", key]

  let deriveState = derive(sources.state$.throttle(50))
  let loading$ = deriveState(loadingLens).map(Boolean)
  let user$ = deriveState(baseLens)

  // INTENTS
  let intents = {
    fetch: {
      base$: user$.filter(R.not),
    }
  }

  // FETCHES
  let fetches = {
    base$: intents.fetch.base$
      .flatMapConcat(_ => K.fromPromise(
        A.get(`/api/${baseLens[0]}/${baseLens[1]}/`)
         .then(resp => resp.data.models[baseLens[1]])
         .catch(R.id)
      )),
  }

  // COMPONENT
  let Component = connect(
    {
      loading: loading$,
      user: user$,
    },
    UserDetail
  )

  // ACTIONS
  let action$ = K.merge([
    fetches.base$
      .map(maybeModel => function afterGET(state) {
        return maybeModel instanceof Error
          ? state
          : R.set2(baseLens, maybeModel, state)
      }),

    K.merge(R.values(intents.fetch)).map(R.K(R.over2(loadingLens, B.safeInc))),
    K.merge(R.values(fetches)).delay(1).map(R.K(R.over2(loadingLens, B.safeDec))),
  ])

  return {Component, action$}
}
