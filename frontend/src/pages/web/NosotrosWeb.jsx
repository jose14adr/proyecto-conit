import { nosotrosWebContent } from "../../data/nosotrosWebContent";

function NosotrosWeb() {
  const { hero, about, pillars, values } = nosotrosWebContent;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO */}
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-300">
            {hero.tag}
          </p>

          <h1 className="mb-5 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
            {hero.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
            {hero.description}
          </p>
        </div>
      </section>

      {/* QUIÉNES SOMOS / PROPÓSITO */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-2">
          {about.map((item, index) => (
            <article
              key={index}
              className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                {item.title}
              </h2>

              <div className="space-y-4">
                {item.paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={paragraphIndex}
                    className="leading-8 text-slate-600"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <p className="mb-3 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-500">
              {pillars.tag}
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              {pillars.title}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {pillars.items.map((item, index) => (
              <article
                key={index}
                className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
              >
                <h3 className="mb-4 text-2xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="leading-8 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="pb-20 pt-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <p className="mb-3 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-500">
              {values.tag}
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              {values.title}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {values.items.map((item, index) => (
              <article
                key={index}
                className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="mb-4 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="leading-8 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default NosotrosWeb;