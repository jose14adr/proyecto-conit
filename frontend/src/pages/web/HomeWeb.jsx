import { Link } from "react-router-dom";
import { homeWebContent } from "../../data/homeWebContent";

function HomeWeb() {
  const { hero, benefits, featured, cta } = homeWebContent;

  return (
    <main className="bg-slate-50 text-slate-900">
      {/* HERO */}
      <section
        className="relative flex min-h-[85vh] items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.72), rgba(15,23,42,0.72)), url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="w-full">
          <div className="mx-auto max-w-6xl px-5 py-20 text-white">
            <p className="mb-4 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-400">
              {hero.tag}
            </p>

            <h1 className="mb-5 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
              {hero.title}
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-200">
              {hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to={hero.primaryButton.to}
                className="rounded-lg bg-sky-400 px-6 py-3 font-semibold text-white transition hover:bg-sky-500"
              >
                {hero.primaryButton.text}
              </Link>

              <Link
                to={hero.secondaryButton.to}
                className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-gray-200"
              >
                {hero.secondaryButton.text}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="relative z-10 -mt-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-3">
          {benefits.map((item, index) => (
            <div key={index} className="rounded-2xl bg-white p-7 shadow-lg">
              <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
              <p className="leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CURSOS DESTACADOS */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <p className="mb-3 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-400">
              {featured.tag}
            </p>
            <h2 className="text-3xl font-bold">{featured.title}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featured.items.map((item, index) => (
              <article key={index} className="rounded-2xl bg-white p-8 shadow-md">
                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>

                <p className="mb-5 leading-relaxed text-slate-600">
                  {item.description}
                </p>

                <Link
                  to={item.to}
                  className="font-semibold text-sky-500 hover:underline"
                >
                  {item.linkText}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">{cta.title}</h2>

            <p className="mx-auto mb-6 max-w-2xl text-gray-200">
              {cta.description}
            </p>

            <Link
              to={cta.buttonTo}
              className="rounded-lg bg-sky-400 px-6 py-3 font-semibold text-white transition hover:bg-sky-500"
            >
              {cta.buttonText}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomeWeb;