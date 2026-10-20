import React from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { Link } from '../router';
import {
  ShieldCheck,
  HardDrive,
  Globe,
  Lock,
  AlertTriangle,
  FileText,
  Trash2,
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Breadcrumb items={[{ label: 'Privacy Policy' }]} />

        {/* Header */}
        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Client-Side Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Effective Date: October 20, 2026 • Last Reviewed: October 2026
          </p>
          <p className="text-base text-slate-300 leading-relaxed">
            101 JSON Toolkit is built from the ground up to protect your code, configurations, and data.
            This policy transparently explains what data stays on your machine, what network requests occur,
            and how your browser storage is used.
          </p>
        </div>

        {/* Core Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-5 rounded-xl bg-[#121620] border border-[#1A202C] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">No Payload Transmission</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your JSON text, schemas, and queries are never sent to a backend server. All parsing,
              formatting, and linting happen locally in your browser.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#121620] border border-[#1A202C] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">Local Browser Storage</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Workspace tabs and UI divider ratios are preserved in your browser's localStorage for convenience.
              No cookies or tracking tokens are set.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#121620] border border-[#1A202C] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">Zero Telemetry</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We do not run Google Analytics, session recorders, tracking beacons, or third-party advertising scripts.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              1. Processing of Your JSON Payloads
            </h2>
            <p>
              When you paste, upload, or edit JSON inside any tool on this website (such as the{' '}
              <Link to="/json-formatter" className="text-[#38BDF8] hover:underline">
                JSON Formatter
              </Link>{' '}
              or{' '}
              <Link to="/json-validator" className="text-[#38BDF8] hover:underline">
                JSON Validator
              </Link>
              ), that data remains strictly on your local machine.
            </p>
            <p>
              The application logic is written entirely in client-side JavaScript and Web APIs.
              Our codebase does not contain backend ingestion endpoints, server-side loggers, or telemetry collectors.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              2. Browser Storage & Stored Data Keys
            </h2>
            <p>
              To provide a seamless developer experience across browser sessions, 101 JSON Toolkit uses the
              standard browser <code className="text-[#38BDF8] bg-[#121620] px-1.5 py-0.5 rounded">localStorage</code>{' '}
              API under explicit keys:
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#1A202C] bg-[#121620] my-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#262D3D] text-slate-400 font-mono">
                    <th className="py-2.5 px-4 font-semibold">Storage Key</th>
                    <th className="py-2.5 px-4 font-semibold">Purpose</th>
                    <th className="py-2.5 px-4 font-semibold">Safety Boundary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A202C] text-slate-300 font-mono">
                  <tr>
                    <td className="py-2.5 px-4 text-[#38BDF8]">101_json_toolkit_tabs_v1</td>
                    <td className="py-2.5 px-4 font-sans">
                      Preserves your open workspace tabs, document titles, and active input across page refreshes.
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400">
                      Payloads &gt; 1.5MB are omitted from persistence to avoid exceeding storage quotas.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-[#38BDF8]">101_json_toolkit_editor_split_ratio</td>
                    <td className="py-2.5 px-4 font-sans">
                      Stores your preferred horizontal editor frame width (clamped between 20% and 80%).
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400">
                      Stores only a single numeric percentage string.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong className="text-white">How to clear stored data:</strong> You can click the "Clear Tab"
              button in any editor header to wipe active document text, or clear "Cookies and Site Data" in
              your browser settings for this domain.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              3. External Network Requests
            </h2>
            <p>
              While your JSON payloads are never uploaded, your browser makes standard HTTP requests to load
              static website assets when loading the webpage:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Hosting & Content Delivery:</strong> Static assets (HTML, CSS,
                compiled JavaScript bundles, and SVG icons) are served via Netlify's global edge network.
                Standard web server access logs (such as requesting IP address and User-Agent headers) are generated
                by Netlify for infrastructure security, DDoS prevention, and routing.
              </li>
              <li>
                <strong className="text-white">Web Typography:</strong> The application imports the "Inter" and
                "JetBrains Mono" typefaces from Google Fonts (<code className="text-slate-400 font-mono">fonts.googleapis.com</code>{' '}
                and <code className="text-slate-400 font-mono">fonts.gstatic.com</code>). These requests retrieve font files
                and stylesheets; no document payloads or form inputs are attached to these font requests.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              4. Cookies, Identifiers & Analytics
            </h2>
            <p>
              101 JSON Toolkit sets <strong className="text-white">zero HTTP cookies</strong>.
              We do not use advertising tracking pixels, fingerprinting techniques, or behavioral analytics software.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              5. Important Security & Usage Notice
            </h2>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/50 text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div className="space-y-1">
                <span className="font-semibold block text-white">Shared & Public Workstations</span>
                <span className="text-slate-300">
                  Because workspace tabs are cached in browser localStorage for your convenience, anyone with
                  physical access to your browser profile could inspect previously opened tabs unless you click
                  "Clear Tab" or use a Private / Incognito browsing session.
                </span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[#1A202C]">
            <h2 className="text-xl font-bold text-white tracking-tight">
              6. Contact for Privacy Questions
            </h2>
            <p>
              If you have questions regarding this privacy policy or wish to report a security concern,
              please visit our{' '}
              <Link to="/contact" className="text-[#38BDF8] hover:underline">
                Contact & Feedback Page
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
export default PrivacyPage;
