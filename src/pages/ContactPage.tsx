import React from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { Link } from '../router';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Code2,
  ExternalLink,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Breadcrumb items={[{ label: 'Contact & Feedback' }]} />

        {/* Header */}
        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Developer Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact & Feedback
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Have a bug report, RFC compliance inquiry, feature suggestion, or feedback on 101 JSON Toolkit?
            We appreciate developer contributions that make this toolkit more reliable.
          </p>
        </div>

        {/* Feedback Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Bug Reports & RFC Edge Cases */}
          <div className="p-6 rounded-xl bg-[#121620] border border-[#1A202C] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Bug className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Syntax & RFC Parsing Issues</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                If our JSON Validator, JSONPath evaluator, or Schema engine produces an unexpected error
                or fails on a legal RFC 8259 / RFC 9535 test case, please share:
              </p>
              <ul className="text-xs text-slate-400 list-disc pl-5 space-y-1">
                <li>A sanitized minimal reproducible JSON snippet (no private keys).</li>
                <li>The expected vs. actual parser diagnostic message.</li>
                <li>Your browser version and operating system.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#1A202C]">
              <span className="text-xs text-slate-500 block">
                Primary Channel: Public Issue Tracker / Developer Feedback
              </span>
            </div>
          </div>

          {/* Card 2: Feature Ideas & Usability */}
          <div className="p-6 rounded-xl bg-[#121620] border border-[#1A202C] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Feature Requests</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Looking for additional export formats, JSON Schema draft support (e.g. 2020-12 dialect additions),
                or specialized JSONPath filters? We prioritize features that benefit common developer workflows.
              </p>
            </div>

            <div className="pt-4 border-t border-[#1A202C]">
              <span className="text-xs text-slate-500 block">
                Community Driven: Tested against international web standards
              </span>
            </div>
          </div>
        </div>

        {/* Direct Inquiries & Project Communication Status */}
        <section className="p-6 rounded-xl bg-[#121620] border border-[#1A202C] space-y-4 mb-12">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#38BDF8]" />
            <span>Project Communication Status</span>
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-3">
            <p>
              101 JSON Toolkit is currently distributed as an open, client-side static web application.
              A dedicated support inbox and public issue repository have not yet been configured for this deployment.
            </p>
            <p>
              When filing feedback or documenting RFC compliance test cases in your own records or future issue submissions:
            </p>
            <ul className="text-xs text-slate-400 list-disc pl-5 space-y-1.5">
              <li>Always sanitize data to strip authentication tokens, passwords, and proprietary fields before sharing.</li>
              <li>Include the tool name (e.g., JSON Validator, JSONPath Evaluator) and expected RFC behavior.</li>
              <li>Document the exact error line and column reported by the parser diagnostic.</li>
            </ul>
            <p className="text-xs text-slate-400 pt-1">
              <em>Note on Privacy:</em> Because all parsing and formatting execute entirely within your web browser,
              no server-side copies or logs of your JSON exist. You retain 100% control over your data.
            </p>
          </div>
        </section>

        {/* Quick Links */}
        <section className="pt-8 border-t border-[#1A202C]">
          <h2 className="text-lg font-bold text-white mb-4">Related Pages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/about"
              className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white">About the Project</h3>
              <p className="text-xs text-slate-400 mt-1">Read our mission and architecture</p>
            </Link>
            <Link
              to="/privacy"
              className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white">Privacy Policy</h3>
              <p className="text-xs text-slate-400 mt-1">Review client-side data boundaries</p>
            </Link>
            <Link
              to="/json-validator"
              className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white">JSON Validator</h3>
              <p className="text-xs text-slate-400 mt-1">Test your JSON syntax now</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
export default ContactPage;
