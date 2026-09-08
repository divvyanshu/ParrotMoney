import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Mail, Phone, MapPin, Globe, ExternalLink, ScrollText } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight">Privacy Policy</h2>
                  <p className="text-xs font-semibold text-[#10B981] uppercase tracking-widest mt-0.5">Sybrate Technologies Private Limited</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-slate-250 flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-850 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrolling Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-sm leading-relaxed text-slate-600 font-sans">
              
              {/* Introduction Card / Disclaimer Alert Box */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 md:p-6 space-y-4">
                <div className="flex gap-2.5 items-center">
                  <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-ping" />
                  <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">Lending Facilitator Note</span>
                </div>
                <p className="text-emerald-950 font-medium">
                  <strong>At Sybrate Technologies Private Limited (“ParrotMoney”, “we”, “our”, or “us”)</strong>, we prioritize the security and confidentiality of your personal and financial information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you interact with our digital platform (&ldquo;Platform&rdquo;), including our website, mobile application, and services. As a lending marketplace facilitator, ParrotMoney connects users with regulated financial institutions.
                </p>
                <div className="p-4 bg-white/80 rounded-xl space-y-2 border border-emerald-200 text-xs text-emerald-900 leading-normal">
                  <p>
                    <strong className="text-[#059669]">Note:</strong> ParrotMoney does not directly provide loans or credit. We connect loan seekers with regulated financial institutions, including banks and non-banking financial companies (NBFCs).
                  </p>
                  <p>
                    ParrotMoney is not an organization registered with the Reserve Bank of India or with the Insurance Regulatory and Development Authority of India and does not hold any license to engage in any activities relating to lending/borrowing/insurance distribution or investments.
                  </p>
                  <p>
                    All financial products offered on our platform are subject to the terms and conditions as applicable and as may be notified or amended from time to time without notice, by the respective Lending Partners. The final decision as regards lending and borrowing and all other financial services is subject to the determination of the Lending Partners and is not determined by the Company.
                  </p>
                  <p>
                    The information provided on our platform is for general knowledge only and should not be considered as financial advice. Always exercise caution and seek professional advice before making any financial decisions.
                  </p>
                  <p>
                    The Content contained on the Platform or other terms are provided on an &quot;as is&quot;, &quot;as available&quot; basis and are protected by copyright. You may not distribute the Content to others without the express written consent of the Company. You may not copy, download, publish, distribute or reproduce any of the Content contained on the Platform in any form without prior permission of the Company.
                  </p>
                </div>
              </div>

              {/* 1. Scope and Applicability */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">1</span>
                  Scope and Applicability
                </h3>
                <p>
                  This Privacy Policy applies to all individuals who:
                </p>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs font-medium text-slate-700">
                  <div className="flex gap-2">
                    <span className="text-[#10B981]">•</span>
                    <span>Use or access the ParrotMoney Platform</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#10B981]">•</span>
                    <span>Submit a loan inquiry, application, or related financial data</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#10B981]">•</span>
                    <span>Communicate with us or engage with our partner ecosystem through digital or offline channels</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  This Policy does not apply to the practices of third-party financial institutions, credit bureaus, or websites that may be accessible through links on our Platform. We encourage you to read their respective privacy policies.
                </p>
              </section>

              {/* 2. Information We Collect */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">2</span>
                  Information We Collect
                </h3>
                <p>
                  We collect personal and non-personal information to provide and improve our services. This section details the categories of data we may collect:
                </p>
                
                {/* 2.1 */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-2 mt-2">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wide">2.1 Personal Information</h4>
                  <p className="text-xs text-slate-600">Personal information refers to any information that can directly or indirectly identify you, such as:</p>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                    <li><strong>Identity Details:</strong> Name, date of birth, PAN, Aadhaar number, voter ID, or passport.</li>
                    <li><strong>Contact Details:</strong> Phone number, email address, and residential address.</li>
                    <li><strong>Financial Information:</strong> Income details, bank statements, credit history, loan eligibility information, and payment records.</li>
                    <li><strong>Employment Details:</strong> Employer name, job title, employment type, and income proof.</li>
                    <li><strong>Property Information:</strong> Details about the property for which you seek a loan, including its location and estimated value.</li>
                  </ul>
                </div>

                {/* 2.2 */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-2 mt-4">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wide">2.2 Non-Personal Information</h4>
                  <p className="text-xs text-slate-600">Non-personal information includes technical and usage data that cannot identify you individually, such as:</p>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                    <li>Device information (IP address, browser type, operating system).</li>
                    <li>Website usage data (pages visited, time spent, and navigation paths).</li>
                    <li>Cookies and tracking technologies (more details in Section 8).</li>
                  </ul>
                </div>

                {/* 2.3 */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-2 mt-4">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wide">2.3 Sensitive Personal Data</h4>
                  <p className="text-xs text-slate-600">
                    Sensitive Personal Data refers to information related to passwords, financial details, and other sensitive identifiers. We collect such data only when necessary for providing our services and in compliance with applicable laws.
                  </p>
                </div>
              </section>

              {/* 3. How We Collect Information */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">3</span>
                  How We Collect Information
                </h3>
                <p>We collect information through various methods:</p>
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                  <li><strong>Directly from You:</strong> When you register on our Platform, fill out loan applications, or contact us for support.</li>
                  <li><strong>Automatically:</strong> Through cookies, log files, and tracking tools when you use our Platform.</li>
                  <li><strong>Third Parties:</strong> From lenders, financial institutions, or credit bureaus to assess loan eligibility and match you with the best options.</li>
                </ul>
              </section>

              {/* 4. Purpose of Collecting Your Information */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">4</span>
                  Purpose of Collecting Your Information
                </h3>
                <p>We collect and process your data for the following purposes:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-900 block mb-1">Loan Facilitation</span>
                    <span className="text-xs text-slate-500">To connect you with suitable lenders, process loan applications, and verify your eligibility.</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-900 block mb-1">Customer Support</span>
                    <span className="text-xs text-slate-500">To assist you with queries, requests, and troubleshooting.</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-900 block mb-1">Service Improvement</span>
                    <span className="text-xs text-slate-500">To analyze user behavior and enhance the Platform&rsquo;s features and functionality.</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-900 block mb-1">Marketing and Communication</span>
                    <span className="text-xs text-slate-500">To inform you about relevant offers, updates, and new services. You can opt out at any time.</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 md:col-span-2">
                    <span className="text-xs font-bold text-slate-900 block mb-1">Legal Compliance</span>
                    <span className="text-xs text-slate-500">To fulfill our obligations under applicable laws and respond to lawful requests from regulatory authorities.</span>
                  </div>
                </div>
              </section>

              {/* 5. Sharing and Disclosure of Information */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">5</span>
                  Sharing and Disclosure of Information
                </h3>
                <p>Your information may be shared with third parties only under the following circumstances:</p>

                {/* 5.1 */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-1 mt-2">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wide">5.1 With Lenders and Financial Partners</h4>
                  <p className="text-xs text-slate-600">
                    We share your information with banks, non-banking financial companies (NBFCs), and other financial institutions to match you with suitable loan products and process your application.
                  </p>
                </div>

                {/* 5.2 */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-1 mt-4">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wide">5.2 With Service Providers</h4>
                  <p className="text-xs text-slate-600">
                    We engage third-party service providers for technology, data analysis, marketing, and customer support services. These providers are bound by confidentiality agreements and may only use your data for specified purposes.
                  </p>
                </div>

                {/* 5.3 */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-1 mt-4">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wide">5.3 Legal and Regulatory Obligations</h4>
                  <p className="text-xs text-slate-600">We may disclose your information to:</p>
                  <ul className="list-disc pl-5 text-xs text-slate-500">
                    <li>Comply with legal obligations or court orders.</li>
                    <li>Cooperate with regulatory authorities or law enforcement agencies.</li>
                    <li>Protect our rights, safety, or property, as well as those of our users.</li>
                  </ul>
                </div>

                {/* 5.4 */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-1 mt-4">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wide">5.4 Business Transfers</h4>
                  <p className="text-xs text-slate-600">
                    In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of the transaction, subject to applicable confidentiality and privacy safeguards.
                  </p>
                </div>
              </section>

              {/* 6. Data Retention */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">6</span>
                  Data Retention
                </h3>
                <p>
                  We retain your data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law. Once the retention period expires, your information will be securely deleted or anonymized. Factors influencing retention periods include:
                </p>
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-500/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-normal">
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">Legal Obligations</span>
                    <span className="text-slate-500">Mandates to maintain financial records under law.</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">Customer Relationships</span>
                    <span className="text-slate-500">Ongoing engagements and dynamic status monitoring.</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">Claim Protection</span>
                    <span className="text-slate-500">Defending against historical, legal, or procedural tasks.</span>
                  </div>
                </div>
              </section>

              {/* 7. Security Measures */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">7</span>
                  Security Measures
                </h3>
                <p>
                  We take robust measures to protect your information against unauthorized access, alteration, or disclosure. Our security practices include:
                </p>
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                  <li>Encryption of sensitive data during transmission.</li>
                  <li>Secure servers and firewalls to prevent breaches.</li>
                  <li>Regular monitoring and security audits to identify vulnerabilities.</li>
                  <li>Role-based access controls limiting employee access to your sensitive records.</li>
                </ul>
                <p className="text-xs italic text-slate-500">
                  While we strive to safeguard your information, no system is entirely secure, and we cannot guarantee absolute security. Therefore, we encourage you to take precautions such as using strong passwords and avoiding sharing sensitive information via unsecured channels.
                </p>
              </section>

              {/* 8. Cookies and Tracking Technologies */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">8</span>
                  Cookies and Tracking Technologies
                </h3>

                {/* 8.1 */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-1 mt-2">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wide">8.1 What Are Cookies?</h4>
                  <p className="text-xs text-slate-600">
                    Cookies are small text files stored on your device that help us understand how you interact with our Platform. We use cookies to enhance your experience by remembering preferences, analyzing usage, and delivering targeted interest communications.
                  </p>
                </div>

                {/* 8.2 */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-1 mt-4">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wide">8.2 Types of Cookies We Use</h4>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                    <li><strong>Essential Cookies:</strong> Necessary for the secure operation of our Platform.</li>
                    <li><strong>Analytical Cookies:</strong> Help us analyze user behavior patterns and optimize site layouts.</li>
                    <li><strong>Advertising Cookies:</strong> Deliver contextually relevant communications based on your actions.</li>
                  </ul>
                </div>

                {/* 8.3 */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-1 mt-4">
                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wide">8.3 Managing Cookies</h4>
                  <p className="text-xs text-slate-600">
                    You can manage or disable cookies through your browser settings. Please note that disabling cookies may affect the function and interface availability of our Platform.
                  </p>
                </div>
              </section>

              {/* 9. Your Rights */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">9</span>
                  Your Rights
                </h3>
                <p>As a user, you have the following rights concerning your personal data:</p>
                
                <div className="space-y-4 mt-2">
                  <div className="flex gap-3">
                    <strong className="text-xs text-slate-900 uppercase tracking-wider w-36 shrink-0 pt-0.5">9.1 Right to Access</strong>
                    <span className="text-xs text-slate-500">You can request a copy of the personal information we hold about you.</span>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-xs text-slate-900 uppercase tracking-wider w-36 shrink-0 pt-0.5">9.2 Right to Correction</strong>
                    <span className="text-xs text-slate-500">You can request corrections to inaccuracies in your data.</span>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-xs text-slate-900 uppercase tracking-wider w-36 shrink-0 pt-0.5">9.3 Right to Deletion</strong>
                    <span className="text-xs text-slate-500">You may request the deletion of your personal information, subject to legal and contractual obligations.</span>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-xs text-slate-900 uppercase tracking-wider w-36 shrink-0 pt-0.5">9.4 Right to Withdraw</strong>
                    <span className="text-xs text-slate-500">You can withdraw your consent for processing specific data, where applicable.</span>
                  </div>
                  <div className="flex gap-3">
                    <strong className="text-xs text-slate-900 uppercase tracking-wider w-36 shrink-0 pt-0.5">9.5 Data Portability</strong>
                    <span className="text-xs text-slate-500">Where feasible, you can request the structured transfer of your data to another service provider.</span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  To exercise your rights, please contact us at <a href="mailto:hello@parrotmoney.in" className="text-[#10B981] hover:underline font-bold">hello@parrotmoney.in</a>. We may require verification of your identity before processing any direct request.
                </div>
              </section>

              {/* 10. Third-Party Links */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">10</span>
                  Third-Party Links
                </h3>
                <p>
                  Our Platform may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies before sharing any information.
                </p>
              </section>

              {/* 11. Children’s Privacy */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">11</span>
                  Children&rsquo;s Privacy
                </h3>
                <p>
                  Our Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe we have collected such data, please contact us immediately, and we will take appropriate corrective action.
                </p>
              </section>

              {/* 12. Changes to This Privacy Policy */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">12</span>
                  Changes to This Privacy Policy
                </h3>
                <p>
                  We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. The updated policy will be posted on our Platform with the revised effective date. We encourage you to review this Privacy Policy regularly.
                </p>
              </section>

              {/* 13. Contact Us */}
              <section className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">13</span>
                  Contact Us
                </h3>
                <p>
                  If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, please reach out to us:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {/* Cards */}
                  <div className="flex gap-3.5 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Mail className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">Email Support</span>
                      <a href="mailto:support@parrotmoney.in" className="text-sm font-bold text-slate-900 hover:text-[#10B981] break-all">support@parrotmoney.in</a>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Globe className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">Official Website</span>
                      <a href="https://www.parrotmoney.in" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-900 hover:text-[#10B981] flex items-center gap-1">
                        www.parrotmoney.in
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Phone className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">Phone Contact</span>
                      <a href="tel:+919999657000" className="text-sm font-bold text-slate-900 hover:text-[#10B981]">+91 9999-657-000</a>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <MapPin className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">Headquarters Address</span>
                      <span className="text-sm font-bold text-slate-900 leading-tight block">
                        SCO #389-390, Sector 29, Gurugram - 122002
                      </span>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Sticky Modal Footer */}
            <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-xs font-medium text-slate-500">
                Effective: June 2026 • © 2026 ParrotMoney
              </span>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-[#10B981] hover:bg-[#10B981]/90 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#10B981]/15 active:scale-95 transition-all text-center cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
