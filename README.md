# deep-assert
[![Build Status](https://img.shields.io/travis/andywer/deep-assert/master.svg?style=flat-square)](https://travis-ci.org/andywer/deep-assert)
[![npm](https://img.shields.io/npm/v/deep-assert.svg?style=flat-square)](https://www.npmjs.com/package/deep-assert)

Providing a better deep-equals assertion experience.

* Easily write object and array expectations, with `any()` and `satisfies()`
* Create your own custom assertions
* Short, but precise diffs, even for large nested objects
* Works with objects, arrays, dates, buffers, etc
* Zero dependencies

<br />

<p align=center>
  <img alt="Terminal" src="./media/terminal.png" width="80%" />
</p>

## Installation

```
npm install deep-assert
```

## Usage

### Basic

Let's say we want to check if an array of user objects matches our expectation, but we don't know what the `id` is gonna be, since it's a random ID. It's easy, using `any()`.

```js
import * as assert from "assert-deep"

assert.deepEquals(getUsers(), [
  {
    id: assert.any(),
    name: "John Smith",
    active: true
  },
  {
    id: assert.any(),
    name: "Jane Smith",
    active: false
  }
])
```

### Custom assertions

Let's try the previous use case again, but this time we check that the `id` is a valid UUIDv4. We use the `satisfies()` helper function to create a custom assertion to be used within the object expectation.

```js
import * as assert from "assert-deep"

const uuidRegex = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/
const assertUUID = assert.satisfies(value => typeof value === "string" && value.match(uuidRegex))

assert.deepEquals(getUsers(), [
  {
    id: assertUUID(),
    name: "John Smith",
    active: true
  },
  {
    id: assertUUID(),
    name: "Jane Smith",
    active: false
  }
])
```

### Spreading any()

Normally `deepEquals()` will fail if there are unexpected properties on the tested object. We can use `any()` with the object spread operator to allow additional properties to be present.

`deepEquals()` will then only check the expected properties and ignore all other ones.

```js
import * as assert from "assert-deep"

assert.deepEquals(getUsers()[0], {
  name: "John Smith",
  active: true,
  ...assert.any()
})
```

### Recursive objects

```js
import * as assert from "assert-deep"

const a = { foo: {} }
a.foo.parent = a.foo

assert.deepEquals(a, {
  foo: assert.satisfies(foo => assert.deepEquals(foo, { parent: foo }))
})
```

## License

MIT
