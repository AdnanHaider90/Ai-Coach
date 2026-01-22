import Link from "next/link";

export default function Landing() {
  return (
    <main className="space-y-12">
      <header className="text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">
          AI Coach MVP
        </p>
        <h1 className="text-4xl font-bold text-slate-900">
          Life, Career, and Finance coaching in one chat.
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Pick your coach, set goals, and get a 3-step action plan with every
          reply. Built to be safe, supportive, and practical.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/login" className="btn-primary">
            Get Started
          </Link>
          <Link href="/dashboard" className="btn-ghost">
            View Dashboard
          </Link>
        </div>
      </header>
      <section className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Life Coach",
            copy: "Habits, clarity, and consistency without medical advice."
          },
          {
            title: "Career Coach",
            copy: "Skills, resumes, interview prep, and 30/60/90 plans."
          },
          {
            title: "Finance Coach",
            copy: "Budgeting and saving with the disclaimer you expect."
          }
        ].map((item) => (
          <div key={item.title} className="card p-6 space-y-3">
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="text-sm text-slate-600">{item.copy}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
