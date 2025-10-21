'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/Button';
import { Section } from '@/components/Section';

interface Service {
  title: string;
  price: string;
  description: string;
  features: string[];
}

export default function ServicesPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const services: Service[] = [
    {
      title: 'Website Development',
      price: 'Starting at $1,200',
      description: 'Custom, professional websites that represent your brand and convert visitors into customers.',
      features: [
        'Custom responsive design for all devices',
        'Domain registration and setup',
        'Professional email addresses',
        'Secure hosting included',
        'SEO optimization',
        'Content management system',
        'Contact forms and integrations',
        'Analytics setup',
      ],
    },
    {
      title: 'CRM & Lead Management',
      price: 'Starting at $500',
      description: 'Never lose another lead. Automated systems to capture, track, and nurture your customers.',
      features: [
        'Custom CRM setup and configuration',
        'Lead capture forms and landing pages',
        'Automated email follow-ups',
        'Contact management and segmentation',
        'Pipeline tracking',
        'Integration with existing tools',
        'Reporting and analytics',
        'Team training included',
      ],
    },
    {
      title: 'Content Creation',
      price: 'Starting at $500/mo',
      description: 'Professional content that tells your story with network television quality standards.',
      features: [
        'Professional video production',
        'Photography and image editing',
        'Graphic design and branding',
        'Written content and copywriting',
        'Social media content',
        'Product photography',
        'Event coverage',
        'Brand consistency across all media',
      ],
    },
    {
      title: 'Brand Strategy',
      price: 'Starting at $2,500',
      description: 'Discover who you are, what makes you unique, and how to communicate it effectively.',
      features: [
        'Brand positioning and messaging',
        'Target audience research',
        'Competitive analysis',
        'Visual identity development',
        'Logo and brand guide creation',
        'Tone of voice guidelines',
        'Marketing strategy framework',
        'Implementation roadmap',
      ],
    },
    {
      title: 'Social Media Management',
      price: 'Starting at $500/mo',
      description: 'Consistent, engaging presence across your social platforms without the daily hassle.',
      features: [
        'Content calendar planning',
        'Daily post creation and scheduling',
        'Community management',
        'Engagement and response handling',
        'Performance analytics',
        'Platform optimization',
        'Hashtag and trend research',
        'Monthly strategy calls',
      ],
    },
    {
      title: 'Email Marketing',
      price: 'Starting at $750',
      description: 'Strategic email campaigns that nurture relationships and drive results.',
      features: [
        'Email marketing platform setup',
        'List management and segmentation',
        'Campaign design and copywriting',
        'Automated workflow creation',
        'A/B testing and optimization',
        'Performance tracking',
        'Template design',
        'Compliance and deliverability',
      ],
    },
  ];

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Complete Digital Solutions
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Professional expertise meets streamlined efficiency
          </p>
        </div>
      </section>

      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleExpanded(index)}
                  className="w-full p-8 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-purple-600 font-semibold">{service.price}</p>
                  </div>
                  {expandedIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-purple-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-purple-600" />
                  )}
                </button>

                {expandedIndex === index && (
                  <div className="px-8 pb-8 border-t border-slate-200">
                    <p className="text-slate-600 mb-6 mt-6">{service.description}</p>
                    <h4 className="font-bold text-slate-900 mb-4">What's Included:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <span className="text-purple-600 mr-2">✓</span>
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Take our 3-minute Content Strategy Survey to receive a personalized proposal for your business
            </p>
            <Button variant="primary" href="/get-started">
              Start Your Content Strategy
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
