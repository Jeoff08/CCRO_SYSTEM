import React, { useState } from "react";

const VIEWS = { SYSTEM: "system", DEVELOPER: "developer" };

const DEVELOPERS = [
  {
    name: "Jay E. Bodiongan",
    role: "Developer",
    image: "/jay-bodiongan.png",
    school: "Student from St. Peter's College, majoring in Computer Science.",
    interests: "Web Development, Software Engineering, Open Source.",
    contact: "jaybodiongan0@gmail.com",
    github: "https://github.com/Jay154421",
    githubLabel: "github.com/Jay154421",
  },
  {
    name: "Kenn Jay Q. Bastasa",
    role: "Developer",
    image: "/kenn.jpg",
    school: "Student from St. Peter's College, majoring in Computer Science.",
    interests: "Web Development, Documenting, Logics & Theories.",
    contact: "kennjaybastasa@gmail.com",
    github: "https://github.com/superkenj",
    githubLabel: "github.com/superkenj",
  },
  {
    name: "Jeoff G. Montebon",
    role: "Developer",
    image: "/597153275_874693071717417_851105044449189897_n-removebg-preview.png",
    school: "Student from St. Peter's College, majoring in Computer Science.",
    interests: "Web Development, Documenting, UI/UX, Open source.",
    contact: "jeoffmontebon0@gmail.com",
    github: "https://github.com/Jeoff08",
    githubLabel: "github.com/Jeoff08",
  },
];

export default function AboutDeveloper() {
  const [activeView, setActiveView] = useState(VIEWS.DEVELOPER);

  return (
    <div className="min-h-[60vh]">
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveView(VIEWS.SYSTEM)}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeView === VIEWS.SYSTEM
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          About the System
        </button>
        <button
          type="button"
          onClick={() => setActiveView(VIEWS.DEVELOPER)}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeView === VIEWS.DEVELOPER
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          About the Developer
        </button>
      </div>

      {activeView === VIEWS.SYSTEM && (
        <div className="space-y-6 max-w-3xl">
          <header>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
              About the System
            </h1>
            <p className="mt-1 text-sm text-stone-500 font-medium">
              CCRO Archive Locator System · City Civil Registrar&apos;s Office, Iligan
            </p>
            <p className="mt-3 text-stone-600 leading-relaxed">
              The CCRO Archive Locator System helps locate civil registry documents (Birth, Marriage, Death certificates) stored in physical archive boxes. It maps certificate type, year, month, and registry number to physical locations (bay, shelf, row, box number) in the archive.
            </p>
          </header>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">What the System Does</h2>
            <ul className="space-y-1.5 text-stone-600 text-sm">
              <li>Locates document boxes from certificate type, year, month, and registry number</li>
              <li>Manages box records and location configuration</li>
              <li>Tracks box checkouts and returns (E-Log)</li>
              <li>Manages personnel records</li>
              <li>Exports and imports box data for backup</li>
              <li>Logs search and admin activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">Certificate Types</h2>
            <ul className="space-y-1 text-stone-600 text-sm">
              <li><strong className="text-stone-800">COLB</strong> Birth · <strong className="text-stone-800">COM</strong> Marriage · <strong className="text-stone-800">COD</strong> Death</li>
            </ul>
          </section>
        </div>
      )}

      {activeView === VIEWS.DEVELOPER && (
        <>
          <header className="mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
              About the developers
            </h1>
            <p className="mt-2 text-stone-600 max-w-xl">
              The team behind the CCRO Archive Locator System — Computer Science students from St. Peter's College.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEVELOPERS.map((dev, index) => (
          <article
            key={dev.name}
            className="relative rounded-2xl border border-stone-200 overflow-hidden min-h-[280px] shadow-sm hover:shadow-lg hover:border-emerald-300 transition-transform duration-300 bg-transparent transform hover:-translate-y-1"
            style={{
              animation: "aboutFadeIn 0.5s ease-out forwards",
              animationDelay: `${0.12 * index}s`,
              opacity: 0,
              backgroundImage: dev.image ? `url(${dev.image})` : undefined,
              backgroundSize: "70%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Soft overlay to make image background more transparent */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" aria-hidden />
            <div className="relative z-10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 mb-1">
                {dev.role}
              </p>
              <h2 className="text-lg font-bold text-black tracking-tight">
                {dev.name}
              </h2>
              <p className="text-sm text-black mt-1">{dev.school}</p>
              <p className="text-sm text-black mt-4 leading-relaxed">
                {dev.interests}
              </p>
              <div className="mt-5 space-y-2 text-sm">
                <a
                  href={`mailto:${dev.contact}`}
                  className="block text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {dev.contact}
                </a>
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-emerald-600 hover:text-emerald-700 font-medium break-all"
                >
                  {dev.githubLabel}
                </a>
              </div>
            </div>
          </article>
        ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes aboutFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

