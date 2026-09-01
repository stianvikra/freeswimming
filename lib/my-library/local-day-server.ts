import { cookies } from "next/headers";
import {
  LOCAL_DAY_TIMEZONE_COOKIE_NAME,
  resolveLocalDayContext,
  type LocalDayContextResolution,
  type ResolvedLocalDayContext,
} from "@/lib/my-library/local-day";

export type LocalDayCookieReader = {
  get(name: string): { value: string } | undefined;
};

export type RequestLocalDayContextOptions = {
  explicitTimezone?: unknown;
  now?: Date;
};

export function resolveLocalDayContextFromCookieReader(
  cookieReader: LocalDayCookieReader,
  { explicitTimezone, now = new Date() }: RequestLocalDayContextOptions = {}
): LocalDayContextResolution {
  return resolveLocalDayContext({
    now,
    explicitTimezone,
    cookieTimezone: cookieReader.get(LOCAL_DAY_TIMEZONE_COOKIE_NAME)?.value,
  });
}

export async function getRequestLocalDayContext(
  options: RequestLocalDayContextOptions = {}
): Promise<LocalDayContextResolution> {
  const cookieStore = await cookies();
  return resolveLocalDayContextFromCookieReader(cookieStore, options);
}

export async function getRequestReadLocalDayContext({
  now,
}: Pick<RequestLocalDayContextOptions, "now"> = {}): Promise<ResolvedLocalDayContext> {
  const context = await getRequestLocalDayContext({ now });
  if (context.status !== "resolved") {
    throw new Error("Read-only local-day context cannot contain an invalid explicit timezone.");
  }
  return context;
}
