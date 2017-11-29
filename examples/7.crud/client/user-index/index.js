import A from "axios"
import * as F from "framework"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import * as M from "common/models"
import UserIndex from "./UserIndex"

export let seed = {
  filterFn: R.id,
  sortFn: R.ascend(R.prop("id")),
}

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["users"]

  let intents = {
    fetch$: O.fromPromise(A.get("/api/users/~/id"))
      .map(resp => R.pluck("id", resp.data.data))
      .catch(err => {
        console.warn(err) // TODO
        return O.of()
      })
      .withLatestFrom(sources.state$, (requiredIds, state) => {
        let presentIds = R.keys(R.view(baseLens, state))
        let missingIds = R.difference(requiredIds, presentIds)
        return missingIds
      })
      .filter(R.length)
      .concatMap(ids => A.get(`/api/users/${R.join(",", ids)}`))
      .map(resp => resp.data.data)
      .catch(err => {
        console.warn(err) // TODO
        return O.of()
      })
      .share()
  }

  let action$ = O.merge(
    intents.fetch$.map(users => {
      return function afterFetch(state) {
        return R.over(baseLens, R.mergeFlipped(users), state)
      }
    }),
  )

  let index$ = D.run(
    () => D.makeStore({assertFn: R.id}),
    // D.withLog({key}),
  )(
    D.init(seed),
  ).$

  let users$ = D.derive(
    {
      table: sources.state$.pluck("users"),
      index: index$,
    },
    ({table, index}) => {
      return R.pipe(
        R.values,
        R.filter(index.filterFn),
        R.sort(index.sortFn),
      )(table)
    }
  )

  let Component = F.connect(
    {
      users: users$,
    },
    UserIndex,
  )

  return {action$, Component}
}