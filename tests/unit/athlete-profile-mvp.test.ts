import { describe, expect, it } from "vitest";
import {
  buildAthleteProfilePrimaryName,
  buildAthleteProfileUpsert,
  getAthleteAgeBandLabel,
} from "@/lib/athlete-profile/mvp";

describe("athlete profile mvp", () => {
  it("builds valid upsert payloads with trimmed text fields", () => {
    expect(
      buildAthleteProfileUpsert({
        displayName: "  Stian  ",
        firstName: "  Stian ",
        lastName: " Vikra ",
        ageBand: "35_44",
      })
    ).toEqual({
      display_name: "Stian",
      first_name: "Stian",
      last_name: "Vikra",
      age_band: "35_44",
    });
  });

  it("rejects completely empty payloads", () => {
    expect(
      buildAthleteProfileUpsert({
        displayName: " ",
        firstName: "",
        lastName: null,
        ageBand: "",
      })
    ).toBeNull();
  });

  it("rejects invalid age band values", () => {
    expect(
      buildAthleteProfileUpsert({
        displayName: "Stian",
        ageBand: "999",
      })
    ).toBeNull();
  });

  it("prefers display name over first and last name", () => {
    expect(
      buildAthleteProfilePrimaryName({
        displayName: "Poolside Stian",
        firstName: "Stian",
        lastName: "Vikra",
      })
    ).toBe("Poolside Stian");
  });

  it("maps age band labels", () => {
    expect(getAthleteAgeBandLabel("35_44")).toBe("35 to 44");
  });
});
