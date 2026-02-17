import { describe, expect, it } from "vitest";
import { parseUserDeleteRequestBody, USER_DELETE_CONFIRM_VALUE } from "@/lib/user/delete";

describe("parseUserDeleteRequestBody", () => {
  it("requires object payload with explicit delete confirmation", () => {
    expect(parseUserDeleteRequestBody(null)).toEqual({
      ok: false,
      error: "Invalid JSON.",
      status: 400,
    });

    expect(parseUserDeleteRequestBody({})).toEqual({
      ok: false,
      error: `Confirmation required. Send confirm="${USER_DELETE_CONFIRM_VALUE}".`,
      status: 400,
    });

    expect(parseUserDeleteRequestBody({ confirm: "delete" })).toEqual({
      ok: false,
      error: `Confirmation required. Send confirm="${USER_DELETE_CONFIRM_VALUE}".`,
      status: 400,
    });
  });

  it("accepts confirmation value DELETE", () => {
    expect(parseUserDeleteRequestBody({ confirm: USER_DELETE_CONFIRM_VALUE })).toEqual({
      ok: true,
    });
  });
});
