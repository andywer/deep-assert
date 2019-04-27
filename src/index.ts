import { deepEquals as internalDeepEquals, Options } from "./deep-equals"

export * from "./deep-equals"

export default function deepEquals(actual: any, expected: any, opts?: Options) {
  const result = internalDeepEquals(actual, expected, [], opts)

  if (result instanceof Error) {
    // Keep the stack trace short and sweet
    throw Error(result.message)
  }
}

export {
  deepEquals
}
