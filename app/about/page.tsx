import React from 'react';
import Image from 'next/image';
import { Tv, Camera, Palette, TrendingUp } from 'lucide-react';
import { Button } from '@/components/Button';
import { StudioCard } from '@/components/StudioCard';
import { Section } from '@/components/Section';

export default function AboutPage() {
  const credentials = [
    {
      icon: <Tv className="w-12 h-12 text-purple-600" />,
      title: 'TV Editing',
      description: '20+ years editing for major networks. Hundreds of episodes delivered to broadcast standards.',
    },
    {
      icon: <Camera className="w-12 h-12 text-purple-600" />,
      title: 'Photography',
      description: 'Professional photographer and videographer capturing stories that resonate.',
    },
    {
      icon: <Palette className="w-12 h-12 text-purple-600" />,
      title: 'Graphic Design',
      description: 'Visual design that communicates your brand with clarity and impact.',
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-purple-600" />,
      title: 'Content Strategy',
      description: 'Strategic approach to digital presence built on decades of storytelling experience.',
    },
  ];

  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            20+ Years of Professional Experience
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            From network television to digital excellence
          </p>
        </div>
      </section>

      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl aspect-square flex items-center justify-center p-12">
              <Image
                src="/ELEC_Logo_Silver.png"
                alt="Electric Studio"
                width={400}
                height={200}
                className="w-full h-auto brightness-125"
              />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Expertise That Makes a Difference
              </h2>
              <div className="space-y-4 text-slate-700">
                <p className="text-lg">
                  With over two decades of experience as a network television editor, I've delivered hundreds of episodes to broadcast standards for major networks. This foundation in professional media production brings an unmatched level of quality and expertise to every digital project.
                </p>
                <p className="text-lg">
                  As a professional photographer, videographer, and graphic designer, I understand how to tell compelling stories across every medium. This comprehensive skill set means your project is handled with the attention to detail and creative excellence that comes from years of deadline-driven, high-stakes production work.
                </p>
                <p className="text-lg">
                  Today, I bring that same broadcast-quality approach to helping businesses build their digital presence. From strategy to execution, every element is crafted with the precision and professionalism that defined my network television career.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Areas of Expertise
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {credentials.map((credential, index) => (
                <StudioCard key={index} hover>
                  <div className="mb-4">{credential.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {credential.title}
                  </h3>
                  <p className="text-slate-600">{credential.description}</p>
                </StudioCard>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              The Electric Studio Difference
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Professional-grade work delivered with the efficiency and clarity that comes from decades of high-pressure production environments. No learning curves. No amateur mistakes. Just results.
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
