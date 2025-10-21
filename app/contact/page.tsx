'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/Button';
import { StudioCard } from '@/components/StudioCard';
import { Section } from '@/components/Section';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', businessName: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Let's Work Together
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Get in touch to discuss your project
          </p>
        </div>
      </section>

      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Send a Message</h2>

              <StudioCard>
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✓</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Message Received!
                    </h3>
                    <p className="text-slate-600">
                      We'll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="businessName" className="block text-sm font-semibold text-slate-700 mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <Button type="submit" variant="primary" className="w-full">
                      Send Message
                    </Button>
                  </form>
                )}
              </StudioCard>

              <div className="mt-6 text-center">
                <p className="text-slate-600 mb-4">Or start with our Content Strategy Survey</p>
                <Button variant="secondary" href="/get-started">
                  Take the 3-Minute Survey →
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Contact Information</h2>

              <div className="space-y-6">
                <StudioCard>
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                      <a
                        href="mailto:studio@electricstudio.com"
                        className="text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        studio@electricstudio.com
                      </a>
                    </div>
                  </div>
                </StudioCard>

                <StudioCard>
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
                      <a
                        href="tel:+15551234567"
                        className="text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        (555) 123-4567
                      </a>
                    </div>
                  </div>
                </StudioCard>

                <StudioCard>
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Location</h3>
                      <p className="text-slate-600">Remote</p>
                      <p className="text-slate-500 text-sm">Serving Businesses Everywhere</p>
                    </div>
                  </div>
                </StudioCard>
              </div>

              <div className="mt-8 bg-purple-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Best Way to Get Started
                </h3>
                <p className="text-slate-600 mb-6">
                  For the fastest and most accurate response, we recommend starting with our 3-minute Content Strategy Survey. You'll receive a custom proposal within 24-48 hours.
                </p>
                <Button variant="primary" href="/get-started" className="w-full">
                  Start Your Content Strategy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
