# deep-assert&nbsp;&nbsp;[![Build Status](https://travis-ci.org/andywer/deep-assert.svg?branch=master)](https://travis-ci.org/andywer/deep-assert)

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

Not yet published to npm.

## Usage

### Basic

```js
import * as assert from "assert-deep"

assert.deepEquals(getUsers() , [
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

```js
import * as assert from "assert-deep"

const uuidRegex = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/
const assertUUID = assert.satisfies(value => typeof value === "string" && value.match(uuidRegex))

assert.deepEquals(getUsers() , [
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

## License

MIT
