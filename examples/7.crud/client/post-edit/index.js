import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {validate} from "tcomb-validation"
import * as T from "common/types"
import * as B from "../blueprints"
import PostForm from "./PostForm"

// SEED
export let seed = {
  input: {
    title: "",
    text: "",
    tags: "",
    isPublished: false,
    publishDate: "",
  },
  errors: {},
}

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["posts", params.id]

  // INTENTS
  let intents = {
    changeTitle$: sources.DOM.fromName("title").listen("input")
      .map(ee => ee.element.value),

    changeText$: sources.DOM.fromName("text").listen("input")
      .map(ee => ee.element.value),

    changeTags$: sources.DOM.fromName("tags").listen("input")
      .map(ee => ee.element.value),

    changeIsPublished$: sources.DOM.fromName("isPublished").listen("click")
      .map(ee => ee.element.checked),

    changePublishDate$: sources.DOM.fromName("publishDate").listen("input")
      .map(ee => ee.element.value),

    submit$: sources.DOM.from("form").listen("submit")
      .map(ee => (ee.event.preventDefault(), ee))
      .map(R.always(true)),
  }

  // FETCH
  let fetchStart$ = sources.state$
    .filter(s => !R.view2(baseLens, s))

  let fetchEnd$ = fetchStart$
    .thru(B.fetchModel(baseLens))

  // STATE
  let form$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(seed),

    intents.changeTitle$.map(x => R.set2(["input", "title"], x)),
    intents.changeTitle$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.title)
      return res.isValid()
        ? R.unset2(["errors", "title"])
        : R.set2(["errors", "title"], res.firstError().message)
    }),

    intents.changeText$.map(x => R.set2(["input", "text"], x)),
    intents.changeText$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.text)
      return res.isValid()
        ? R.unset2(["errors", "text"])
        : R.set2(["errors", "text"], res.firstError().message)
    }),

    intents.changeTags$.map(x => R.set2(["input", "tags"], x)),
    intents.changeTags$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.tags)
      return res.isValid()
        ? R.unset2(["errors", "tags"])
        : R.set2(["errors", "tags"], res.firstError().message)
    }),

    intents.changeIsPublished$.map(x => R.set2(["input", "isPublished"], x)),
    intents.changeIsPublished$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.isPublished)
      return res.isValid()
        ? R.unset2(["errors", "isPublished"])
        : R.set2(["errors", "isPublished"], res.firstError().message)
    }),

    intents.changePublishDate$.map(x => R.set2(["input", "publishDate"], x)),
    intents.changePublishDate$.debounce(200).map(x => {
      let res = validate(x, T.PostForm.meta.props.publishDate)
      return res.isValid()
        ? R.unset2(["errors", "publishDate"])
        : R.set2(["errors", "publishDate"], res.firstError().message)
    }),

    // Resets
    sources.state$.map(R.view2(["posts", params.id])).filter(Boolean).map(post => function initFromRoot() {
      let input = {
        title: post.title,
        text: post.text,
        tags: R.join(", ", post.tags),
        isPublished: post.isPublished,
        publishDate: post.publishDate,
      }
      let res = validate(input, T.PostForm)
      if (res.isValid()) {
        let errors = {}
        return {input, errors}
      } else {
        let errors = R.reduce((z, key) => {
          let e = R.find(e => R.equals(e.path, [key]), res.errors)
          return e ? R.set2(key, e.message, z) : z
        }, {}, R.keys(input))
        return {input, errors}
      }
    }),
  ).$

  // COMPONENT
  let Component = F.connect(
    {
      loading: D.deriveOne(sources.state$, ["_loading", key]),
      form: form$,
    },
    PostForm
  )

  // ACTION (external)
  let action$ = K.merge([
    fetchEnd$
      .thru(B.postFetchModel(baseLens)),

    fetchStart$.map(_ => R.set2(["_loading", key], true)),
    fetchEnd$.delay(1).map(_ => R.set2(["_loading", key], false)),

    form$.sampledBy(intents.submit$).flatMapConcat(form => {
      let postForm
      try {
        postForm = T.PostForm(form.input)
      } catch (e) {
        return K.never()
      }
      return K.constant(postForm)
    })
    .thru(B.editModel(baseLens))
    .thru(B.postEditModel(baseLens))
  ])

  return {Component, action$}
}