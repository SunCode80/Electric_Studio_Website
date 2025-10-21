import React from 'react';
import { SurveyEmbed } from '@/components/SurveyEmbed';

export default function GetStartedPage() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Content Strategy Survey
          </h1>
          <p className="text-lg text-slate-200 mb-2">
            Tell us about your business and get a custom strategy
          </p>
          <div className="text-purple-300 flex items-center justify-center gap-2">
            <span>⏱️</span>
            <span>3 minutes</span>
          </div>
        </div>

        <div className="mb-6">
          <SurveyEmbed fullHeight />
        </div>

        <p className="text-slate-300 text-sm text-center">
          🔒 Your information is secure and never shared
        </p>
      </div>
    </section>
  );
}
