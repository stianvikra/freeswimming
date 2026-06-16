import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildCoursePageMetadata } from "./metadata";

export const metadata: Metadata = buildCoursePageMetadata();

export default function CourseLayout({ children }: { children: ReactNode }) {
  return children;
}
