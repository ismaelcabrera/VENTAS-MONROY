import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { pushAvailability } from "./push-availability";

const available = { configured: true, embedded: false, supported: true, ios: false, standalone: false };
describe("phone notification registration", () => {
  test("iframe preview must open in its own tab", () => {
    assert.equal(pushAvailability({ ...available, embedded: true }), "open-in-new-tab");
  });
  test("missing web push configuration cannot register", () => {
    assert.equal(pushAvailability({ ...available, configured: false }), "not-configured");
  });
  test("iPhone requires the home-screen app", () => {
    assert.equal(pushAvailability({ ...available, ios: true }), "ios-home-screen");
    assert.equal(pushAvailability({ ...available, ios: true, standalone: true }), "ready");
  });
  test("unsupported browsers cannot register", () => {
    assert.equal(pushAvailability({ ...available, supported: false }), "unsupported");
  });
});