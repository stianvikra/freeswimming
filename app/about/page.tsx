// app/about/page.tsx
import { redirect } from "next/navigation";

export default function AboutRedirect() {
  redirect("/how-we-teach");
}