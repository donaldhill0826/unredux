// import U from "urlz"

// Error with custom data
export class ErrorX extends Error {
  constructor(data) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(data.message)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorX)
    }

    // Custom debugging information
    for (let k in data) {
      if (k != "message" && k != "name" && k != "constructor") {
        this[k] = data[k]
      }
    }

    this.name = this.constructor.name
  }
}

export function fetchJSON(url, options = {}) {
  // SSR support
  // if (typeof window == "undefined") {
  //   url = U.withProtocol(global.protocol, U.withHost(global.host, url))
  // }

  options = R.mergeDeep(options, {
    credentials: "same-origin",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options.body),
  })

  return fetch(url, options)
    .then(resp => {
      return resp.json()
        .then(body => {
          if (resp.ok) {
            return body
          } else {
            return new ErrorX({status: resp.status, ...body})
          }
        })
        .catch(_ => {
          return new ErrorX({status: resp.status, message: "Invalid JSON"})
        })
    })
}
