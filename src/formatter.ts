import { $any, $compare } from "./symbols"

function createObjectDiff(actual: any, expected: any, propMatches: Array<[string | number, boolean]>): string {
  const maxPropsToPrint = 6
  let propDescriptors = propMatches.map(([prop, matches]) => ({ prop, matches }))

  let trimmedStart = false
  let trimmedEnd = false

  if (propDescriptors.length > maxPropsToPrint) {
    const firstMismatchIndex = propDescriptors.findIndex(desc => !desc.matches)
    if (firstMismatchIndex > 1) {
      propDescriptors = propDescriptors.slice(firstMismatchIndex)
      trimmedStart = true
    }
  }
  if (propDescriptors.length > maxPropsToPrint) {
    const lastMismatchIndex = propDescriptors.map(desc => desc.matches).lastIndexOf(false)
    if (propDescriptors.length - lastMismatchIndex > 2) {
      propDescriptors = propDescriptors.slice(0, lastMismatchIndex + 1)
      trimmedEnd = true
    }
  }
  if (propDescriptors.length > maxPropsToPrint) {
    const firstMismatchIndex = propDescriptors.findIndex(desc => !desc.matches)
    const matchingDescriptorsStack = propDescriptors.filter(desc => desc.matches)
    const mismatchingDescriptorsStack = propDescriptors.filter(desc => !desc.matches)
    const trimmedDescriptors = propDescriptors.slice(0, firstMismatchIndex)

    while (trimmedDescriptors.length < maxPropsToPrint) {
      if (mismatchingDescriptorsStack.length > 0) {
        trimmedDescriptors.push(mismatchingDescriptorsStack.shift() as any)
      } else {
        trimmedDescriptors.push(matchingDescriptorsStack.shift() as any)
      }
    }
    propDescriptors = trimmedDescriptors
  }
  const lines = propDescriptors.reduce(
    (concatenated, descriptor) => {
      const valuePrefix = Array.isArray(actual) ? "" : `${descriptor.prop}: `
      if (descriptor.matches) {
        return concatenated + `    ${valuePrefix}${previewValue(actual[descriptor.prop])},\n`
      } else {
        return concatenated +
          (descriptor.prop in actual ? `-   ${valuePrefix}${previewValue(actual[descriptor.prop])},\n` : "") +
          (descriptor.prop in expected ? `+   ${valuePrefix}${previewValue(expected[descriptor.prop])},\n` : "")
      }
    },
    ""
  )
  const [openingBrace, closingBrace] = Array.isArray(actual) ? ["[", "]"] : ["{", "}"]
  return `  ${openingBrace}\n${trimmedStart ? "  ...\n" : ""}${lines}${trimmedEnd ? "  ...\n" : ""}  ${closingBrace}`
}

export function createObjectDiffMessage(message: string, actual: any, expected: any, path: Array<string | number>, propMatches: Array<[string | number, boolean]>): string {
  const pathHeadline = path.length > 0 ? `  .${describePath(path)}:\n` : ""
  const objectDiff = createObjectDiff(actual, expected, propMatches)
  return `${message}\n  - Actual, + Expected\n\n${pathHeadline}${objectDiff}`
}

export function describePath(path: Array<string | number>): string {
  let description = String(path[0])

  for (const fragment of path.slice(1)) {
    description += typeof fragment === "number"
      ? `[${fragment}]`
      : `.${fragment}`
  }

  return description
}

function previewValue(value: any) {
  if (value === undefined) {
    return "undefined"
  } else if (value === null) {
    return "null"
  } else if (typeof value === "object" && value[$any]) {
    return "any()"
  } else if (typeof value === "object" && value[$compare]) {
    return "satisfies(…)"
  } else if (Array.isArray(value)) {
    return value.length === 0 ? "[]" : "[ … ]"
  } else if (Buffer.isBuffer(value)) {
    return `Buffer[${value.length}]`
  } else if (typeof value === "object") {
    return Object.keys(value).length === 0 ? "{ }" : "{ … }"
  } else if (typeof value === "symbol") {
    return value.toString()
  } else {
    const stringified = JSON.stringify(value)
    return stringified.length < 70 ? stringified : stringified.substr(0, 69) + "…"
  }
}
