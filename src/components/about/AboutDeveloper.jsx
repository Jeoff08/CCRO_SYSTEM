import React from "react";

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
  return (
    <div className="min-h-[60vh]">
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

