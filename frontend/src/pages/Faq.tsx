import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "How does HomeBite ensure food hygiene and safety?",
    a: "Every home chef registered on HomeBite must pass strict sanitary inspections of their kitchens, obtain standard food handler certifications, and undergo regular hygiene checks conducted by our operations audit team."
  },
  {
    q: "How are the delivery fees and times calculated?",
    a: "Delivery fees are flat (₹5) and all delivery times are determined directly by the home chef based on dish preparation times and geographical distance from your location, usually ranging between 25-45 minutes."
  },
  {
    q: "Can I cancel my food order after placing it?",
    a: "Orders can be cancelled with a full refund within 5 minutes of placement. After 5 minutes, the home chef has already begun preparing your ingredients, so cancellations are no longer permitted."
  },
  {
    q: "How can I register as a home chef on HomeBite?",
    a: "During the signup flow, simply toggle the account registration role to 'Home Chef'. Once registered, our chef onboarding team will contact you to schedule a kitchen inspection and help set up your digital menu."
  }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-slate-500 text-sm">Find quick answers to common queries about order placement, safety audits, and kitchen setups.</p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 flex justify-between items-center text-left font-bold text-sm sm:text-base hover:text-primary transition-colors focus:outline-none"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
