'use client';

import React from 'react';
import { ChevronDown, Globe, Database, Video, Target } from 'lucide-react';
import { Button } from '@/components/Button';
import { StudioCard } from '@/components/StudioCard';
import { Section } from '@/components/Section';
import { SurveyEmbed } from '@/components/SurveyEmbed';

export default function Home() {
  const scrollToSurvey = () => {
    const surveySection = document.getElementById('survey');
    surveySection?.scrollIntoView({ behavior: 'smooth' });
  };

  const services = [
    {
      icon: <Globe className="w-12 h-12 text-purple-600" />,
      title: 'Website Development',
      description: 'Custom websites with domain, email, and hosting',
    },
    {
      icon: <Database className="w-12 h-12 text-purple-600" />,
      title: 'CRM & Lead Management',
      description: 'Never lose another customer with automated systems',
    },
    {
      icon: <Video className="w-12 h-12 text-purple-600" />,
      title: 'Content Creation',
      description: 'Professional video, photography, graphics, and writing',
    },
    {
      icon: <Target className="w-12 h-12 text-purple-600" />,
      title: 'Brand Strategy',
      description: 'Know exactly who you are and how to communicate it',
    },
  ];

  const credentials = [
    { number: '20+', label: 'Years Experience' },
    { number: '100+', label: 'TV Episodes' },
    { number: 'Network', label: 'Quality Standards' },
    { number: 'Complete', label: 'Digital Solutions' },
  ];

  const processSteps = [
    {
      number: 1,
      title: 'Complete Survey (3 min)',
      description: 'Tell us about your business and goals',
    },
    {
      number: 2,
      title: 'Custom Proposal (24-48 hrs)',
      description: 'Receive tailored strategy presentation',
    },
    {
      number: 3,
      title: 'We Build (5-14 days)',
      description: 'Fast delivery of professional work',
    },
    {
      number: 4,
      title: 'You Launch',
      description: 'Go live with complete digital presence',
    },
  ];

  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-6 py-2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-8">
            ⚡ 20+ Years of Professional Experience
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Complete Digital Solutions for{' '}
            <span className="text-purple-400">Modern Businesses</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto">
            Network television editing expertise meets streamlined efficiency. Professional websites, content creation, and digital strategy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={scrollToSurvey}>
              Start Your Content Strategy
            </Button>
            <Button variant="secondary" href="#services">
              Watch Our Work
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-purple-300" />
        </div>
      </section>

      <section className="bg-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {credentials.map((item, index) => (
              <div key={index}>
                <div className="text-5xl font-extrabold text-white mb-2">{item.number}</div>
                <div className="text-purple-200">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section id="services">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">What We Do</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Professional digital services designed to help your business thrive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <StudioCard key={index} hover>
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-600 mb-4">{service.description}</p>
              <a href="/services" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                Learn More →
              </a>
            </StudioCard>
          ))}
        </div>
      </Section>

      <Section gradient id="survey">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get Your Custom Content Strategy
          </h2>
          <p className="text-xl text-slate-200 mb-4 max-w-2xl mx-auto">
            Answer 10 quick questions and receive a personalized strategy in 48 hours
          </p>
          <div className="text-purple-300 flex items-center justify-center gap-2">
            <span>⏱️</span>
            <span>Takes just 3 minutes</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <SurveyEmbed />
          <p className="text-slate-300 text-sm text-center mt-6">
            🔒 Your information is secure and never shared
          </p>
        </div>
      </Section>

      <Section>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="primary" onClick={scrollToSurvey}>
            Start Content Strategy →
          </Button>
        </div>
      </Section>

      <Section className="bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Ready to Transform Your Digital Presence?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Start with our 3-minute Content Strategy Survey and get your customized approach within 48 hours
          </p>
          <Button variant="primary" onClick={scrollToSurvey}>
            Get Your Custom Strategy
          </Button>
        </div>
      </Section>
    </>
  );
}
