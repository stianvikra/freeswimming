import Link from "next/link";

export default function ProgramsPage() {
  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-3xl glass-card rounded-3xl p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Swim Programs</h1>
        <p className="mt-3 text-slate-700">
          Placeholder page for MVP. Add your PDFs, plans, and links here.
        </p>

        <div className="mt-6">
          <Link className="text-blue-600 hover:underline" href="/">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}