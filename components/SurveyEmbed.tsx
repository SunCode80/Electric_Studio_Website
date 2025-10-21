'use client';

import React from 'react';

interface SurveyEmbedProps {
  fullHeight?: boolean;
}

export function SurveyEmbed({ fullHeight = false }: SurveyEmbedProps) {
  const heightStyle = fullHeight
    ? { height: 'calc(100vh - 200px)', minHeight: '600px' }
    : { height: '800px', minHeight: '600px' };

  return (
    <iframe
      src="https://content-strategy-survey-sefmorris.replit.app"
      className="w-full border-0 rounded-2xl shadow-2xl bg-white"
      style={heightStyle}
      title="Content Strategy Survey"
      loading="lazy"
      allow="clipboard-write"
    />
  );
}
