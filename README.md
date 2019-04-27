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
