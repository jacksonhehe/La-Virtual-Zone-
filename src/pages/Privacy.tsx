import React, { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lock, ArrowUp } from "lucide-react";
import SEO from "../components/SEO";

/** Simple slugify for heading ids */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const Privacy = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/docs/legal/privacy.md")
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, []);

  const toc: TocItem[] = useMemo(() => {
    if (!content) return [];
    const lines = content.split("\n");
    const items: TocItem[] = [];
    for (const line of lines) {
      const m = /^(#{2,3})\s+(.*)/.exec(line.trim());
      if (m) {
        const level = m[1].length;
        const text = m[2].trim();
        const id = slugify(text);
        items.push({ id, text, level });
      }
    }
    return items;
  }, [content]);

  const components = {
    h1: (props: any) => (
      <h1 id={slugify(String(props.children))} className="!mt-0">{props.children}</h1>
    ),
    h2: (props: any) => {
      const id = slugify(String(props.children));
      return (
        <h2 id={id} className="scroll-mt-28 border-b border-indigo-500/40 pb-1">{props.children}</h2>
      );
    },
    h3: (props: any) => {
      const id = slugify(String(props.children));
      return (
        <h3 id={id} className="scroll-mt-28 text-indigo-300">{props.children}</h3>
      );
    },
    a: (props: any) => (
      <a {...props} className="underline decoration-dotted underline-offset-4 hover:text-indigo-300" />
    )
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <SEO title="Política de Privacidad" description="Cómo protegemos tus datos en La Virtual Zone" canonical="https://lavirtualzone.com/privacidad" />
      <section className="relative w-full py-10 md:py-16">
      {/* Hero */}
      <div className="container mx-auto px-4 text-center mb-10 md:mb-16">
        <span className="inline-flex items-center justify-center bg-gradient-to-br from-indigo-600 to-primary-light rounded-full p-4 shadow-neon mb-4">
          <Lock size={42} className="text-white" />
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white font-display mb-3 drop-shadow">
          Política de Privacidad
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          Conoce cómo protegemos tus datos en La Virtual Zone.
        </p>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8">
        {/* Main legal body */}
        <article
          className="bg-bg-surface/80 backdrop-blur-md rounded-2xl border border-indigo-700/60 shadow-lg p-6 md:p-10 text-gray-100 prose prose-invert prose-h2:text-indigo-300 prose-h3:text-indigo-200 prose-a:text-primary-light max-w-none"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {content}
          </ReactMarkdown>
        </article>

        {/* TOC (desktop) */}
        <aside className="hidden lg:block sticky top-28 h-max bg-bg-overlay/40 backdrop-blur rounded-xl border border-gray-700 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Contenido
          </h3>
          <nav className="space-y-1 text-sm">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block pl-${(item.level - 2) * 4} text-gray-300 hover:text-indigo-300 transition-colors`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </aside>
      </div>

      {/* Back to top */}
      <button
        onClick={scrollTop}
        aria-label="Volver arriba"
        className="fixed bottom-6 right-6 z-10 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg transition-colors"
      >
        <ArrowUp size={20} />
      </button>
    </section>
    </>
  );
};

export default Privacy;