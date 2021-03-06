# Unredux

An experimental set of tools for cross-platform **framework-less** development (500 lines of core + libraries!).
Framework-less approach assumes you are willing to assemble the final thing yourself, buying more
control and flexibility at the cost of additional boilerplate.

Think [CycleJS](https://cycle.js.org/) without drivers built on [Kefir](https://kefirjs.github.io),
[Kefir.DB](https://github.com/ivan-kleshnin/kefir.db), and [React](https://facebook.github.io/react/).
Unredux is compatible with React ecosystem (except `ReactRouter` and some other high-level stuff
replaced with a stream-based code here).

WIP. Highly unstable. *Name is a temporary dummy thing.*

Most frameworks allow you to override important stuff with options. Yet this approach is naturally
limited as option objects simply ain't expressive enough to compete with a real code. As soon as your
app's assumptions are different from that of a framework (a reasonable guess), you start tweaking stuff
here and there, adding more and more ugly hacks in the process. In our experience, the best solution
is often a framework removal.

If you don't like the imperative, object-oriented approach VueJS and MobX promote. If you are not
satisfied with the bundle size, complexity and vendor locks of Angular and GraphQL. If you are sick
of Redux ecosystem and willing to concentrate on the business logic – here's a solution.

Unlike those titles, you can read the **whole code** of Unredux in **one sitting**.

#### Features

* CycleJS-like architecture with sources and sinks but without drivers.
* Reactive dataflow with proactive insertions.
* Reactive state management (think Redux with functions instead of actions).
* Full-scale examples: realistic routing, SSR, etc.
* Declarative data fetching and auto-persistence (in progress).

Component model is as simple as possible (components are called apps here to differentiate them from
React components):

```js
function anyApp(sources, props) {
  sources      // {state$: streamOfStates, DOM: streamOfLocalDOMEvents, ...}
  ...          // -- your code --
  return sinks // {Component: reactComponent, action$: streamOfActions, ...}
}
```

where sources and sinks are records of streams (`Object <KefirStream>` speaking TypeScript), where keys
are predefined and correspond to event or effect types (a complex sentece but it describes everything
about the component model – try to do that for another framework).

Component "composition" is just a function and stream composition, nothing fancy. And as it's not
a framework you can mix and swap stuff without a problem. For example, we use complex stateful React
components like DnD and some unique jQuery plugins together with this architecture in production.

## Docs

* [Framework design comparison](./docs/frameworks.md)
* [Reactive or what?](./docs/reactive-or-what.md)
* [RxJS &rarr; Kefir](./docs/) (Why and How -- TODO)

Also suggested:

* [Kefir docs](kefirjs.github.io/kefir)
* [Kefir.DB docs](https://github.com/ivan-kleshnin/kefir.db)
* [CycleJS docs](https://cycle.js.org/getting-started.html#getting-started)

## Examples

#### [1. Counter](./examples/1.counter)

A basic example.

#### [2. Counters](./examples/2.counters)

Component isolation and reuse.

#### [3.1 Pages](./examples/3.1.pages)

Pages and simple routing.

#### [3.2 Router](./examples/3.2.router)

Advanced routing (**wip**).

#### [4. Todos](./examples/4.todos)

Classic "TodoMVC" app.

#### [5. Todos-History](./examples/5.todos-history)

Todos with a flexible history management.

#### [6. Shopping-Cart](./examples/6.shopping-cart)

Shopping Cart with interactions between "parent" and "child" apps.

#### [7.1 CRUD](./examples/7.1.crud)

CRUD client-server apps showing async data fetching, posting, caching, and more.

#### [7.2 CRUD-SSR](./examples/7.2.crud-ssr)

Previous example extended with SSR.

#### [8. DDL](./examples/8.ddl)

Declarative Data Load, lightweight alternative to **GraphQL+Relay** / **Falcor**.

**Notable differences**:
1. Unlike both (GraphQL / Falcor) it's REST API based (avoiding vendor lock-in on Backend).
2. It's more reactive and declarative where it makes sense with clear fallback paths.
3. Unlike GraphQL it relies on plain data to describe queries, instead of extra DSL layer.
4. Less magic, more boilerplate. Model dependencies are described, not auto-injected.
5. Much smaller code base and bundle size.
6. Validations and Querying are decoupled. Use TsIO, PropTypes, Tcomb or any other dynamic typing
to describe and validate your models. Avoiding vendor lock-in again.

## Usage

Examples are expected to work in Browser and NodeJS environments. The latter will require `babel-node`
(because of ES6 modules).

```
$ npm install babel-cli -g
$ npm install http-server -g
```

#### Browser

1. Fork and download the repo.
2. `$ npm install` in the root to pull common dependencies.
3. `$ cd <example_folder>`.
4. `$ npm install` to pull local example dependencies and symlink vendor libraries (see below).
5. `$ npm start` (check `package.json` scripts).

#### NodeJS

1. Create `some.js` file in the project root.
2. Run the file with `$ babel-node some.js`.
3. Required babel plugins and presets will be applied automatically.

### Prerequisites

* Functional Programming (basics)
* Lensing (basics)
* React (basics)
* Kefir (basics)

## Remarks

### Conventions

We use ASCII [marble diagrams](http://rxmarbles.com/):

```
observable: ---v1---v2---> (time)
```

where `v1` may denote a string `"v1"` or something else, which should be clear from a context.
