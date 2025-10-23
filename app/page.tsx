'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Globe, Database, Video, Target, Share2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { StudioCard } from '@/components/StudioCard';
import { Section } from '@/components/Section';

export default function Home() {

  const services = [
    {
      icon: <Target className="w-12 h-12 text-purple-600" />,
      title: 'Brand Strategy',
      description: 'Know exactly who you are and how to communicate it',
    },
    {
      icon: <Video className="w-12 h-12 text-purple-600" />,
      title: 'Content Creation',
      description: 'Professional video, photography, graphics, and writing',
    },
    {
      icon: <Share2 className="w-12 h-12 text-purple-600" />,
      title: 'Social Media Management',
      description: 'Keep your brand seen where the eyes are',
    },
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
            <Link href="/content-strategy-survey">
              <Button variant="primary">
                Start Your Content Strategy
              </Button>
            </Link>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
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

      <section id="survey" className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-6">
              Get Your Custom Content Strategy
            </h2>
            <p className="text-xl text-slate-200 mb-4">
              Answer 10 quick questions and receive a personalized strategy in 48 hours
            </p>
            <div className="flex items-center justify-center gap-2 text-purple-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Takes just 3 minutes</span>
            </div>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-slate-600 mb-8">
              Click below to open your personalized Content Strategy Survey
            </p>

            <Link
              href="/content-strategy-survey"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-12 py-6 rounded-xl font-bold text-xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
            >
              Start Your Content Strategy Survey →
            </Link>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-purple-600 font-bold text-2xl">3</div>
                <div className="text-slate-600 text-sm">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-purple-600 font-bold text-2xl">10</div>
                <div className="text-slate-600 text-sm">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-purple-600 font-bold text-2xl">48hr</div>
                <div className="text-slate-600 text-sm">Response</div>
              </div>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              🔒 Your information is secure and never shared
            </p>
          </div>
        </div>
      </section>

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
          <Link href="/content-strategy-survey">
            <Button variant="primary">
              Start Content Strategy →
            </Button>
          </Link>
        </div>
      </Section>

    </>
  );
}
