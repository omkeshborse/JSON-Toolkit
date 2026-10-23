import React, { useState } from 'react';
import { GuideArticle } from '../data/guidesContent';
import { Breadcrumb } from '../components/Breadcrumb';
import { Link } from '../router';
import {
  Copy,
  Check,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Sparkles,
  Info,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface GuideDetailPageProps {
  guide: GuideArticle;
}

export const GuideDetailPage: React.FC<GuideDetailPageProps> = ({ guide }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={guide.breadcrumbs} />

      {/* Article Header */}
      <header className="mb-10 pb-8 border-b border-[#1A202C]">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Technical Guide</span>
          </span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-400 font-mono">{guide.readTime}</span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-400 font-mono">Verified RFC Reference</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.2] mb-6">
          {guide.h1}
        </h1>

        <div className="p-4 sm:p-5 rounded-xl bg-[#121620] border border-[#262D3D] space-y-3">
          <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed">
            {guide.intro.lead}
          </p>
          {guide.intro.paragraphs.map((p, idx) => (
            <p key={idx} className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </header>

      {/* Main Grid: Content + Table of Contents Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Article Body */}
        <div className="lg:col-span-8 space-y-12">
          {/* Quick FAQ / Questions Answered Callout */}
          {guide.questionQueries.length > 0 && (
            <section
              aria-labelledby="faq-summary-heading"
              className="p-5 rounded-xl bg-[#0F141E] border border-[#262D3D]"
            >
              <h2
                id="faq-summary-heading"
                className="text-sm font-semibold uppercase tracking-wider text-[#38BDF8] mb-3 flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Questions Answered in This Guide</span>
              </h2>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {guide.questionQueries.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <a
                      href={`#${q.sectionId}`}
                      className="hover:text-[#38BDF8] transition-colors underline decoration-slate-600 underline-offset-2"
                    >
                      {q.question}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Render Sections */}
          {guide.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 space-y-4"
              aria-labelledby={`heading-${section.id}`}
            >
              <h2
                id={`heading-${section.id}`}
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight pt-2"
              >
                {section.heading}
              </h2>

              {section.paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {para}
                </p>
              ))}

              {/* Lists */}
              {section.lists &&
                section.lists.map((list, lIdx) => (
                  <div key={lIdx} className="py-2">
                    {list.type === 'ordered' ? (
                      <ol className="list-decimal pl-6 space-y-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                        {list.items.map((item, iIdx) => (
                          <li key={iIdx}>{item}</li>
                        ))}
                      </ol>
                    ) : (
                      <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                        {list.items.map((item, iIdx) => (
                          <li key={iIdx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

              {/* Comparison Rows (e.g. Invalid vs Valid) */}
              {section.comparisonRows && section.comparisonRows.length > 0 && (
                <div className="space-y-4 pt-2">
                  {section.comparisonRows.map((row, rIdx) => (
                    <div
                      key={rIdx}
                      className="rounded-xl border border-[#1A202C] bg-[#121620] overflow-hidden"
                    >
                      <div className="px-4 py-2 bg-[#161C28] border-b border-[#1A202C] text-xs font-semibold text-slate-200">
                        {row.label}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1A202C]">
                        {/* Invalid side */}
                        <div className="p-3 bg-rose-950/10">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-mono uppercase font-bold text-rose-400">
                              ✕ Invalid Syntax
                            </span>
                            <button
                              onClick={() => handleCopy(row.invalidCode, `comp-inv-${rIdx}`)}
                              className="text-slate-400 hover:text-white p-1 rounded transition"
                              aria-label="Copy invalid snippet"
                            >
                              {copiedIndex === `comp-inv-${rIdx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <pre className="font-mono text-xs text-rose-200 bg-[#0B0D13] p-3 rounded-lg overflow-x-auto border border-rose-900/30">
                            <code>{row.invalidCode}</code>
                          </pre>
                        </div>

                        {/* Valid side */}
                        <div className="p-3 bg-emerald-950/10">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-mono uppercase font-bold text-emerald-400">
                              ✓ Valid RFC 8259
                            </span>
                            <button
                              onClick={() => handleCopy(row.validCode, `comp-val-${rIdx}`)}
                              className="text-slate-400 hover:text-white p-1 rounded transition"
                              aria-label="Copy valid snippet"
                            >
                              {copiedIndex === `comp-val-${rIdx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <pre className="font-mono text-xs text-emerald-200 bg-[#0B0D13] p-3 rounded-lg overflow-x-auto border border-emerald-900/30">
                            <code>{row.validCode}</code>
                          </pre>
                        </div>
                      </div>
                      <div className="px-4 py-2.5 bg-[#0E1118] border-t border-[#1A202C] text-xs text-slate-400">
                        <strong className="text-slate-300">Explanation:</strong> {row.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Code Examples */}
              {section.codeExamples && section.codeExamples.length > 0 && (
                <div className="space-y-4 pt-2">
                  {section.codeExamples.map((example, eIdx) => (
                    <div
                      key={eIdx}
                      className="rounded-xl border border-[#262D3D] bg-[#0E1118] overflow-hidden"
                    >
                      <div className="px-4 py-2 bg-[#161C28] border-b border-[#262D3D] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                          <span className="font-semibold text-slate-200">
                            {example.title || `Example ${eIdx + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-500 uppercase">
                            {example.language}
                          </span>
                          <button
                            onClick={() => handleCopy(example.code, `ex-${section.id}-${eIdx}`)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-[#121620] hover:bg-[#1A202C] text-slate-300 hover:text-white transition text-[11px] cursor-pointer"
                            aria-label={`Copy ${example.title || 'code snippet'}`}
                          >
                            {copiedIndex === `ex-${section.id}-${eIdx}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-medium">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <pre className="font-mono text-xs sm:text-sm text-slate-200 p-4 overflow-x-auto bg-[#07090E] leading-relaxed">
                        <code>{example.code}</code>
                      </pre>
                      {example.caption && (
                        <div className="px-4 py-2 bg-[#121620]/60 border-t border-[#1A202C] text-xs text-slate-400 flex items-center gap-2">
                          <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                          <span>{example.caption}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Callouts */}
              {section.callout && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 my-4 text-xs sm:text-sm ${
                    section.callout.type === 'warning'
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      : section.callout.type === 'tip'
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                        : 'bg-blue-950/20 border-blue-800/40 text-blue-200'
                  }`}
                >
                  {section.callout.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  ) : section.callout.type === 'tip' ? (
                    <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-semibold mb-1 text-white">
                      {section.callout.title}
                    </strong>
                    <p className="leading-relaxed text-slate-300">{section.callout.content}</p>
                  </div>
                </div>
              )}
            </section>
          ))}

          {/* Primary High-Intent Tool Funnel CTA */}
          <section
            aria-labelledby="cta-heading"
            className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#121620] to-[#1A2234] border border-[#262D3D] shadow-xl relative overflow-hidden"
          >
            <div className="space-y-4 max-w-xl">
              {guide.primaryCta.badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{guide.primaryCta.badge}</span>
                </span>
              )}
              <h2 id="cta-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {guide.primaryCta.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {guide.primaryCta.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={guide.primaryCta.buttonUrl}
                  className="px-5 py-2.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#38BDF8]/10"
                >
                  <span>{guide.primaryCta.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {guide.primaryCta.secondaryUrl && guide.primaryCta.secondaryText && (
                  <Link
                    to={guide.primaryCta.secondaryUrl}
                    className="px-4 py-2.5 rounded-lg bg-[#161C28] hover:bg-[#1F2738] text-slate-200 border border-[#262D3D] text-sm font-medium transition"
                  >
                    <span>{guide.primaryCta.secondaryText}</span>
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* Related Guides Section */}
          {guide.relatedGuides.length > 0 && (
            <nav aria-labelledby="related-guides-heading" className="pt-8 border-t border-[#1A202C] space-y-4">
              <h2 id="related-guides-heading" className="text-lg font-bold text-white">
                Related Developer Guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {guide.relatedGuides.map((rel) => (
                  <Link
                    key={rel.slug}
                    to={rel.route}
                    className="group p-5 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#38BDF8] transition-colors leading-snug">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {rel.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#1A202C] flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-[#38BDF8]">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>

        {/* Sidebar: Sticky Table of Contents & Quick Tool Shortcuts */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Table of Contents */}
            <nav
              aria-label="Table of contents"
              className="p-5 rounded-xl bg-[#121620] border border-[#1A202C] space-y-3"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                On This Page
              </h3>
              <ul className="space-y-2 text-xs">
                {guide.sections.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className="text-slate-400 hover:text-[#38BDF8] transition-colors block py-0.5 line-clamp-1"
                    >
                      {sec.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Quick Workbench Links */}
            <div className="p-5 rounded-xl bg-[#121620] border border-[#1A202C] space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Interactive Workbenches
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/json-validator"
                    className="text-slate-300 hover:text-[#38BDF8] flex items-center justify-between transition-colors py-1"
                  >
                    <span>JSON Syntax Validator</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/json-formatter"
                    className="text-slate-300 hover:text-[#38BDF8] flex items-center justify-between transition-colors py-1"
                  >
                    <span>JSON Formatter & Beautifier</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/json-compare"
                    className="text-slate-300 hover:text-[#38BDF8] flex items-center justify-between transition-colors py-1"
                  >
                    <span>Semantic JSON Diff</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jsonpath"
                    className="text-slate-300 hover:text-[#38BDF8] flex items-center justify-between transition-colors py-1"
                  >
                    <span>JSONPath Query Evaluator</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/json-viewer"
                    className="text-slate-300 hover:text-[#38BDF8] flex items-center justify-between transition-colors py-1"
                  >
                    <span>JSON Tree Inspector</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
};

export default GuideDetailPage;
