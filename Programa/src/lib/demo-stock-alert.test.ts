import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { needsDemoAlert } from "./demo-stock-alert";

const product = { id: "demo", name: "Aceitunas", stock: 42, minStock: 15, active: true };
describe("automatic fictional stock alerts", () => {
  test("a computer stock change to the minimum triggers an alert", () => {
    assert.equal(needsDemoAlert(product, { ...product, stock: 15 }), true);
    assert.equal(needsDemoAlert(product, { ...product, stock: 16 }), false);
  });
  test("depletion triggers a separate alert", () => {
    assert.equal(needsDemoAlert({ ...product, stock: 8 }, { ...product, stock: 0 }), true);
  });
  test("initial demo data and restocking never send alerts", () => {
    assert.equal(needsDemoAlert(undefined, { ...product, stock: 8 }), false);
    assert.equal(needsDemoAlert({ ...product, stock: 8 }, product), false);
  });
  test("low stock does not repeatedly alert until replenished", () => {
    assert.equal(needsDemoAlert({ ...product, stock: 8 }, { ...product, stock: 7 }), false);
    assert.equal(needsDemoAlert(product, { ...product, stock: 8 }), true);
  });
  test("inactive items do not send alerts", () => {
    assert.equal(needsDemoAlert(product, { ...product, stock: 0, active: false }), false);
  });
});