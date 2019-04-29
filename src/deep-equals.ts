// Based on code from <https://github.com/substack/node-deep-equal>

import { createObjectDiffMessage, describePath } from "./formatter"
import { $any, $compare } from "./symbols"

interface ErrorWithPath extends Error {
  path: Array<string | number>
}

export interface Options {
  strict?: boolean
}

type InternalComparisonFunction = (actual: any) => true | Error
type UserComparisonFunction = (actual: any) => boolean

interface AnyComparison {
  // Why not just use $compare?
  // If $any is found on an object with other enumerable properties,
  // we know that it's there because of an object spread
  [$any]: true
}

interface Comparison {
  [$compare]: InternalComparisonFunction
}

const supportsArgumentsClass = (function () {
  return Object.prototype.toString.call(arguments)
})() === '[object Arguments]';

function supported(object: any) {
  return Object.prototype.toString.call(object) === '[object Arguments]';
};

function unsupported(object: any) {
  return object &&
    typeof object === 'object' &&
    typeof object.length === 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};

function createMessage(message: string, actual: any, expected: any): string {
  return `${message}:\n    Actual: ${actual}\n  Expected: ${expected}`
}

function isUndefinedOrNull(value: any): value is undefined | null {
  return value === null || value === undefined;
}

function isBuffer(x: any): x is Buffer {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') {
    return false;
  }
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') {
    return false;
  }
  return true;
}

function stripFirstLine(message: string) {
  const indexOfFirstLinebreak = message.indexOf("\n")
  return message.substr(indexOfFirstLinebreak + 1)
}

const isArguments = supportsArgumentsClass ? supported : unsupported

export function any(): AnyComparison {
  return {
    [$any]: true
  }
}

export function satisfies(compare: UserComparisonFunction): Comparison {
  return {
    [$compare]: (actual) => {
      try {
        const result = compare(actual)
        return result === true
          ? true
          : Error(createMessage("Custom value matcher failed", actual, "<custom logic>"))
      } catch (error) {
        return error
      }
    }
  }
}

export function deepEquals(actual: any, expected: any, path: Array<string | number>, opts: Options = {}): true | Error {
  let result: true | Error
  let allowAdditionalProps: boolean = false

  if (expected && expected[$any]) {
    if (typeof expected === "object" && Object.keys(expected).length > 0) {
      // $any got in the object because of an object spread
      allowAdditionalProps = true
    } else {
      return true
    }
  }
  if (expected && expected[$compare]) {
    return (expected as Comparison)[$compare](actual)
  }

  if (actual === expected) {
    result = true;

  } else if (actual instanceof Date && expected instanceof Date) {
    result = (actual.getTime() === expected.getTime()) ||
      Error(createMessage("Dates do not match", actual, expected))

  } else if (!actual || !expected || typeof actual !== 'object' && typeof expected !== 'object') {
    // tslint:disable-next-line
    result = (opts.strict ? actual === expected : actual == expected) ||
      Error(createMessage("Values do not match", actual, expected))

  } else if (isUndefinedOrNull(actual) || isUndefinedOrNull(expected)) {
    return actual === expected || Error(createMessage("Values do not match", actual, expected))

  } else if (["bigint", "boolean", "number", "string", "symbol"].indexOf(typeof actual) > -1) {
    return actual === expected || Error(createMessage("Values do not match", actual, expected))

  } else {
    result = objEquiv(actual, expected, path, allowAdditionalProps, opts)
  }

  if (result instanceof Error && (result as ErrorWithPath).path) {
    return result

  } else if (result instanceof Error) {
    const error = path.length > 0
      ? Error(`Expectation failed: ${describePath(["$root", ...path])} does not match.\n${stripFirstLine(result.message)}`)
      : result

    // tslint:disable-next-line
    return Object.assign((error as ErrorWithPath), { path })
  }

  return true
}

function diffArrayElements(actual: any[], expected: any[], path: Array<string | number>, allowAdditionalProps: boolean, opts: Options) {
  const propMatches: Array<[number, boolean]> = []
  for (let index = 0; index < expected.length; index++) {
    const result = deepEquals(actual[index], expected[index], [...path, index], opts)
    propMatches.push([index, !(result instanceof Error)])
  }

  if (!allowAdditionalProps && actual.length > expected.length) {
    for (let index = expected.length; index < actual.length; index++) {
      propMatches.push([index, false])
    }
  }

  propMatches.sort((pa, pb) => pa > pb ? 1 : -1)
  return propMatches
}

function diffObjectProps(actual: any, expected: any, path: Array<string | number>, allowAdditionalProps: boolean, opts: Options) {
  let actualKeys: string[]
  let expectedKeys: string[]
  try {
    actualKeys = Object.keys(actual)
    expectedKeys = Object.keys(expected)
  } catch (e) {
    // happens when one is a string literal and the other isn't
    return Error(createMessage("Actual value or expectation is a string literal, the other one is not", actual, expected))
  }

  const propMatches: Array<[string, boolean]> = []
  for (const key of expectedKeys) {
    const result = deepEquals(actual[key], expected[key], [...path, key], opts)
    propMatches.push([key, !(result instanceof Error)])
  }

  if (!allowAdditionalProps) {
    const unexpectedKeys = actualKeys.filter(key => expectedKeys.indexOf(key) === -1)
    propMatches.push(...unexpectedKeys.map(key => [key, false]) as Array<[string, boolean]>)
  }

  propMatches.sort((pa, pb) => pa > pb ? 1 : -1)
  return propMatches
}

function objEquiv(actual: any, expected: any, path: Array<string | number>, allowAdditionalProps: boolean, opts: Options): true | Error {
  // an identical 'prototype' property.
  if (actual.prototype !== expected.prototype) {
    return Error(createMessage("Object prototypes do not match", actual, expected))
  }
  // ~~~I've managed to break Object.keys through screwy arguments passing. (@substack)
  //   Converting to array solves the problem.
  if (isArguments(actual)) {
    if (!isArguments(expected)) {
      return Error(createMessage("Got arguments pseudo-array, but did not expect it", actual, expected))
    }
    return deepEquals([...actual], [...expected], path, opts);
  }
  if (isBuffer(expected)) {
    if (!isBuffer(actual)) {
      return Error(createMessage("Expected a buffer", actual, expected))
    }
    if (actual.length !== expected.length) {
      return Error(createMessage("Buffer size does not match", actual.length, expected.length))
    }
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) {
        return Error(createMessage(`Buffer contents do not match at offset ${i}`, actual[i], expected[i]))
      }
    }
    return true;
  }

  if (!Array.isArray(actual) && Array.isArray(expected)) {
    return Error(createMessage("Expected an array", actual, expected))
  } else if (Array.isArray(actual) && !Array.isArray(expected)) {
    return Error(createMessage("Got an array, but did not expect one", actual, expected))
  }

  const propMatches = Array.isArray(expected)
    ? diffArrayElements(actual, expected, path, allowAdditionalProps, opts)
    : diffObjectProps(actual, expected, path, allowAdditionalProps, opts)

  if (propMatches instanceof Error) {
    return propMatches
  }

  if ((propMatches as Array<[string | number, boolean]>).some(([, matches]) => !matches)) {
    const mismatchingSubObjectsProp = (propMatches as Array<[string | number, boolean]>).find(
      ([prop, matches]) => !matches && actual[prop] && expected[prop] && typeof actual[prop] === "object" && typeof expected[prop] === "object"
    )
    if (mismatchingSubObjectsProp) {
      const prop = mismatchingSubObjectsProp[0]
      return deepEquals(actual[prop], expected[prop], [...path, prop], opts)
    } else {
      const message = `${Array.isArray(actual) ? "Arrays" : "Objects"} do not match:`
      return Object.assign(
        Error(createObjectDiffMessage(message, actual, expected, path, propMatches)),
        { path }
      )
    }
  }
  return typeof actual === typeof expected || Error(createMessage("Types of values do not match", typeof actual, typeof expected))
}
