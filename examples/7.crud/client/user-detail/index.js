import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import * as B from "../blueprints"
import UserDetail from "./UserDetail"

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["users", params.id]

  // FETCH
  let fetchStart$ = sources.state$
    .filter(s => !R.view2(baseLens, s))

  let fetchEnd$ = fetchStart$
    .thru(B.fetchModel(baseLens))

  // COMPONENT
  let Component = F.connect(
    {
      loading: D.deriveOne(sources.state$, ["_loading", key]),
      user: D.deriveOne(sources.state$, baseLens),
    },
    UserDetail
  )

  // ACTION (external)
  let action$ = K.merge([
    fetchEnd$
      .thru(B.postFetchModel(baseLens)),

    fetchStart$.map(_ => R.set2(["_loading", key], true)),
    fetchEnd$.delay(1).map(_ => R.set2(["_loading", key], false)),
  ])

  return {Component, action$}
}