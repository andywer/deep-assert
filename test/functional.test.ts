import test from "ava"
import * as assert from "../src/index"

test("does not throw on matching primitive values", t => {
  assert.deepEquals(null, null)
  assert.deepEquals(undefined, undefined)
  assert.deepEquals(true, true)
  assert.deepEquals(false, false)
  assert.deepEquals(2, 2)
  assert.deepEquals(-4.5, -4.5)
  assert.deepEquals("abc", "abc")
  t.pass()
})

test("throws on mismatching primitive values", t => {
  t.throws(() => assert.deepEquals(true, false))
  t.throws(() => assert.deepEquals(null, true))
  t.throws(() => assert.deepEquals(1, 2))
  t.throws(() => assert.deepEquals(1, "a"))
  t.throws(() => assert.deepEquals("abc", "abcd"))
})

test("does not throw on matching objects", t => {
  assert.deepEquals({}, {})
  assert.deepEquals({ foo: null }, { foo: null })
  assert.deepEquals({ foo: "x", bar: 3 }, { foo: "x", bar: 3 })
  assert.deepEquals({ foo: { bar: true } }, { foo: { bar: true } })
  t.pass()
})

test("throws on mismatching objects", t => {
  t.throws(() => assert.deepEquals({}, null))
  t.throws(() => assert.deepEquals({ foo: 1 }, {}))
  t.throws(() => assert.deepEquals({}, { foo: 1 }))
  t.throws(() => assert.deepEquals({ foo: "true" }, { foo: true }))
  t.throws(() => assert.deepEquals({ foo: { bar: 1 } }, { foo: { bar: 2 } }))
})

test("throws on superfluous properties", t => {
  t.throws(() => assert.deepEquals({ foo: 1, bar: 1 }, { foo: 1 }))
})

test("does not throw on matching arrays", t => {
  assert.deepEquals([], [])
  assert.deepEquals(["x"], ["x"])
  assert.deepEquals([1, 2, 3], [1, 2, 3])
  assert.deepEquals(["a", 2, 3, { foo: "bar" }], ["a", 2, 3, { foo: "bar" }])
  t.pass()
})

test("throws on mismatching arrays", t => {
  t.throws(() => assert.deepEquals([], {}))
  t.throws(() => assert.deepEquals({}, []))
  t.throws(() => assert.deepEquals([], { length: 0 }))
  t.throws(() => assert.deepEquals([], ["a"]))
  t.throws(() => assert.deepEquals(["a"], []))
  t.throws(() => assert.deepEquals(["a"], ["b"]))
})

test("any() matches anything", t => {
  assert.deepEquals(null, assert.any())
  assert.deepEquals(undefined, assert.any())
  assert.deepEquals(true, assert.any())
  assert.deepEquals(false, assert.any())
  assert.deepEquals(2, assert.any())
  assert.deepEquals("foo", assert.any())
  assert.deepEquals({}, assert.any())
  assert.deepEquals([], assert.any())
  assert.deepEquals({ foo: 1 }, assert.any())
  assert.deepEquals(["a"], assert.any())
  assert.deepEquals({ foo: 1, bar: 2 }, { foo: assert.any(), bar: 2 })
  assert.deepEquals(["a", "b"], ["a", assert.any()])
  t.pass()
})

test("can spread any()", t => {
  t.notThrows(() => assert.deepEquals(
    { foo: 1, bar: 1 },
    { foo: 1, ...assert.any() }
  ))
})

test("can define custom satisfies()", t => {
  t.notThrows(() => assert.deepEquals(
    { foo: 1, bar: 1 },
    { foo: 1, bar: assert.satisfies((value: number) => value === 1) }
  ))
  t.throws(() => assert.deepEquals(
    { foo: 1, bar: 1 },
    { foo: 1, bar: assert.satisfies((value: number) => value === 2) }
  ))
})

test("can compare recursive data structures", t => {
  const a: any = { foo: {} }
  a.foo.parent = a.foo

  t.notThrows(() => assert.deepEquals(a, {
    foo: assert.satisfies(foo => assert.deepEquals(foo, { parent: foo }))
  }))
})
