# deep-assert
[![Build Status](https://img.shields.io/travis/andywer/deep-assert/master.svg?style=flat-square)](https://travis-ci.org/andywer/deep-assert)
[![npm](https://img.shields.io/npm/v/deep-assert.svg?style=flat-square)](https://www.npmjs.com/package/deep-assert)

The most developer-friendly way to write assertions for large or complicated objects and arrays.

* Use `any()` and `satisfies()` property matchers
* Short, but precise diffs, even for large nested objects
* Works with objects, arrays, dates, buffers, and more
* Write custom property assertions
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

assert.deepEquals(
  // Actual value:
  {
    id: Math.random(),
    name: "John Smith",
    meta: {
      isActive: true,
      lastLogin: new Date("2019-04-29T12:31:00")
    }
  },
  // Expectation:
  {
    id: assert.any(),
    name: "John Smith",
    meta: {
      isActive: true,
      lastLogin: new Date("2019-04-29T12:31:00")
    }
  }
])
```

### Custom assertions

Let's try the previous use case again, but this time we check that the `id` is a valid UUIDv4. We use the `satisfies()` helper function to create a custom assertion to be used within the object expectation.

```js
import * as assert from "assert-deep"

const assertPositiveNumber = () => assert.satisfies(value => typeof value === "number" && value > 0)

assert.deepEquals(
  // Actual value:
  {
    id: Math.random(),
    name: "John Smith",
    meta: {
      isActive: true,
      lastLogin: new Date("2019-04-29T12:31:00")
    }
  },
  // Expectation:
  {
    id: assertPositiveNumber(),
    name: "John Smith",
    meta: {
      isActive: true,
      lastLogin: new Date("2019-04-29T12:31:00")
    }
  }
])
```

### Spreading any()

Normally `deepEquals()` will fail if there are properties on the tested object that don't exist on the expectation. We can use `any()` with the object spread operator to allow additional properties to be present.

`deepEquals()` will then only check the expected properties and ignore all other ones.

```js
import * as assert from "assert-deep"

assert.deepEquals(
  // Actual value:
  {
    id: Math.random(),
    name: "John Smith",
    meta: {
      isActive: true,
      lastLogin: new Date("2019-04-29T12:31:00")
    }
  },
  // Expectation:
  {
    id: assert.any(),
    name: "John Smith",
    ...assert.any()
  }
])
```

### Recursive objects

You can call `deepEquals()` in a custom `satisfies()` as well. This way you can easily test recursive data structures, for instance.

```js
import * as assert from "assert-deep"

const actual = { foo: {} }
actual.foo.parent = actual.foo

assert.deepEquals(actual, {
  foo: assert.satisfies(foo => assert.deepEquals(foo, { parent: foo }))
})
```

## License

MIT
