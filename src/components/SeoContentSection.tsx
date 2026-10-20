import React, { useState } from 'react';
import { ToolSeoData } from '../data/seoContent';
import { Link } from '../router';
import {
  HelpCircle,
  Code2,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  CheckCircle2,
  Layers,
  ChevronDown,
  AlertTriangle,
  FileCode,
  Info
} from 'lucide-react';

interface SeoContentSectionProps {
  content: ToolSeoData;
}

/**
 * Parses markdown-style links [Anchor Text](/path) into accessible React router Link components.
 */
function renderFormattedText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const anchorText = match[1];
    const href = match[2];

    if (href.startsWith('/')) {
      parts.push(
        <Link
          key={`${match.index}-${href}`}
          to={href}
          className="text-[#38BDF8] hover:underline font-medium inline-flex items-center gap-0.5"
        >
          {anchorText}
        </Link>
      );
    } else {
      parts.push(
        <a
          key={`${match.index}-${href}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#38BDF8] hover:underline font-medium"
        >
          {anchorText}
        </a>
      );
    }
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export const SeoContentSection: React.FC<SeoContentSectionProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="mt-16 pt-12 border-t border-[#1A202C] text-left w-full space-y-14" aria-label="Documentation and Guide">
      {/* 1. What Is Section */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-[#38BDF8]" />
          <span>{content.whatIs.heading}</span>
        </h2>
        <div className="space-y-3 max-w-4xl">
          {content.whatIs.paragraphs.map((para, idx) => (
            <p key={idx} className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {renderFormattedText(para)}
            </p>
          ))}
        </div>
      </div>

      {/* 2. How-To Step-by-Step Guide */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
          <span>{content.howTo.heading}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.howTo.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-5 rounded-xl bg-[#121620] border border-[#1A202C] flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="w-7 h-7 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] font-mono text-xs font-bold flex items-center justify-center mb-3">
                  {step.stepNumber}
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Code Example & Technical Reference */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-[#A78BFA]" />
            <span>{content.example.heading}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            {content.example.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {content.example.snippets.map((snippet, idx) => {
            const isCopied = copiedIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#0B0D13] border border-[#262D3D] overflow-hidden flex flex-col shadow-lg"
              >
                <div className="px-4 py-2.5 bg-[#121620] border-b border-[#1A202C] flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-medium truncate">
                    {snippet.label}
                  </span>
                  <button
                    onClick={() => handleCopy(snippet.code, idx)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-[#1A202C] transition-colors cursor-pointer"
                    aria-label={`Copy code for ${snippet.label}`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#34D399]" />
                        <span className="text-[#34D399]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto flex-1">
                  <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre">
                    {snippet.code}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3b. Syntax Error Reference Table (if present) */}
      {content.errorReferenceTable && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>{content.errorReferenceTable.heading}</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              {content.errorReferenceTable.description}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1A202C] bg-[#121620]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#262D3D] bg-[#0B0D13]/70 text-slate-300 font-semibold font-mono">
                  <th className="py-3 px-4 w-44">Syntax Violation</th>
                  <th className="py-3 px-4 w-60">Invalid Token / Example</th>
                  <th className="py-3 px-4 w-60">RFC 8259 Correction</th>
                  <th className="py-3 px-4">Parser Grammar Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A202C] text-slate-300">
                {content.errorReferenceTable.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#161B26] transition-colors align-top">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {row.errorType}
                      <span className="block text-[11px] text-slate-400 font-normal mt-0.5 font-sans">
                        {row.cause}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <code className="text-rose-300 bg-rose-950/40 border border-rose-900/50 px-2 py-1 rounded block whitespace-pre overflow-x-auto">
                        {row.badSnippet}
                      </code>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <code className="text-emerald-300 bg-emerald-950/40 border border-emerald-900/50 px-2 py-1 rounded block whitespace-pre overflow-x-auto">
                        {row.goodSnippet}
                      </code>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 leading-relaxed font-sans">
                      {row.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3c. Detailed Deep-Dive Sections (if present) */}
      {content.detailedSections && content.detailedSections.length > 0 && (
        <div className="space-y-10">
          {content.detailedSections.map((sec, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  <FileCode className="w-5 h-5 text-[#38BDF8]" />
                  <span>{sec.heading}</span>
                </h2>
                {sec.badge && (
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#1A202C] text-[#38BDF8] border border-[#262D3D]">
                    {sec.badge}
                  </span>
                )}
              </div>

              <div className="space-y-3 max-w-4xl">
                {sec.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {renderFormattedText(p)}
                  </p>
                ))}
              </div>

              {sec.callout && (
                <div
                  className={`p-4 rounded-xl border max-w-4xl text-xs sm:text-sm leading-relaxed flex items-start gap-3 ${
                    sec.callout.type === 'warning'
                      ? 'bg-amber-950/20 border-amber-900/50 text-amber-200'
                      : sec.callout.type === 'tip'
                      ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'
                      : 'bg-sky-950/20 border-sky-900/50 text-sky-200'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">{sec.callout.title}</span>
                    <span className="text-slate-300">{renderFormattedText(sec.callout.text)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. Common Use Cases */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {content.useCases.heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.useCases.items.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#121620] border border-[#1A202C] space-y-2"
            >
              <h3 className="text-sm font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.detail || item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Key Concepts & Differences */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-[#60A5FA]" />
          <span>{content.relatedConcepts.heading}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.relatedConcepts.concepts.map((concept, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#121620] border border-[#1A202C] space-y-2"
            >
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#38BDF8]">
                {concept.term}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {renderFormattedText(concept.explanation)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Frequently Asked Questions */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-[#F59E0B]" />
          <span>{content.faqs.heading}</span>
        </h2>
        <div className="space-y-3 max-w-4xl">
          {content.faqs.items.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-lg bg-[#121620] border border-[#1A202C] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-[#38BDF8] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 text-[#38BDF8]' : ''
                    }`}
                  />
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  hidden={!isOpen}
                  className={`px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#1A202C]/60 ${
                    !isOpen ? 'hidden' : ''
                  }`}
                >
                  {renderFormattedText(faq.answer)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Contextual Internal Links to Related Tools */}
      <div className="space-y-6 pt-4 border-t border-[#1A202C]">
        <h2 className="text-xl font-bold text-white tracking-tight">
          {content.relatedTools.heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {content.relatedTools.tools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="group p-5 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1A202C] flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-[#38BDF8]">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
