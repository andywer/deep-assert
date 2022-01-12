import test from "ava"
import * as assert from "../src/index"

test("shows a useful error message for primitive assertions", t => {
  t.throws(
    () => assert.deepEquals(null, 1),
    { message: `
Values do not match:
    Actual: null
  Expected: 1
  `.trim() })
})

test("shows a useful error message for object assertions", t => {
  t.throws(
    () => assert.deepEquals(
      { foo: 1 },
      { foo: 2 }
    ),
    { message:`
Objects do not match:
  - Actual, + Expected

  {
-   foo: 1,
+   foo: 2,
  }
  `.trim() })

  t.throws(
    () => assert.deepEquals(
      { foo: 1 },
      { foo: [2] }
    ),
    { message: `
Objects do not match:
  - Actual, + Expected

  {
-   foo: 1,
+   foo: [ … ],
  }
  `.trim() })

  t.throws(
    () => assert.deepEquals(
      { foo: 1, bar: "x" },
      { foo: 2, bar: "x" }
    ),
    { message: `
Objects do not match:
  - Actual, + Expected

  {
    bar: "x",
-   foo: 1,
+   foo: 2,
  }
  `.trim() })

  t.throws(
    () => assert.deepEquals(
      { foo: { bar: "x", baz: { hello: true } } },
      { foo: { bar: "y", baz: { hello: true } } }
    ),
    { message: `
Objects do not match:
  - Actual, + Expected

  .foo:
  {
-   bar: "x",
+   bar: "y",
    baz: { … },
  }
  `.trim() })

  t.throws(
    () => assert.deepEquals(
      { foo: 1 },
      { bar: 1 }
    ),
    { message: `
Objects do not match:
  - Actual, + Expected

  {
+   bar: 1,
-   foo: 1,
  }
  `.trim() })
})

test("shows a useful error message for array assertions", t => {
  t.throws(
    () => assert.deepEquals(
      [1, 2],
      [1, 3]
    ),
    { message: `
Arrays do not match:
  - Actual, + Expected

  [
    1,
-   2,
+   3,
  ]
  `.trim() })
})
