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
  ChevronDown
} from 'lucide-react';

interface SeoContentSectionProps {
  content: ToolSeoData;
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
              {para}
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
                {concept.explanation}
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
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-[#38BDF8] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 text-[#38BDF8]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#1A202C]/60">
                    {faq.answer}
                  </div>
                )}
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
