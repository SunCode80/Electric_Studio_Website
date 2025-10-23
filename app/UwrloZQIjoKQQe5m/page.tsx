'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Form validation schema
const surveySchema = z.object({
  // Contact Information
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company_name: z.string().min(2, 'Company name is required'),
  website_url: z.string().optional(),
  
  // Business Information
  industry: z.string().min(1, 'Please select an industry'),
  business_description: z.string().min(20, 'Please provide at least 20 characters'),
  target_audience: z.string().min(10, 'Please describe your target audience'),
  unique_value: z.string().min(10, 'Please describe your unique value'),
  
  // Current Situation
  biggest_challenge: z.string().min(10, 'Please describe your biggest challenge'),
  current_marketing: z.array(z.string()).min(1, 'Select at least one option'),
  current_content_frequency: z.string().min(1, 'Please select a frequency'),
  monthly_marketing_budget: z.string().min(1, 'Please select a budget range'),
  
  // Goals & Objectives
  primary_goal: z.string().min(10, 'Please describe your primary goal'),
  success_metric: z.string().min(10, 'Please describe how you measure success'),
  timeline: z.string().min(1, 'Please select a timeline'),
  
  // Content Preferences
  interested_services: z.array(z.string()).min(1, 'Select at least one service'),
  preferred_content_types: z.array(z.string()).min(1, 'Select at least one content type'),
  tone_preference: z.string().min(1, 'Please select a tone'),
  competitor_examples: z.string().optional(),
  
  // Additional Information
  existing_assets: z.array(z.string()),
  additional_info: z.string().optional(),
});

type SurveyFormData = z.infer<typeof surveySchema>;

export default function ContentStrategySurveyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      current_marketing: [],
      interested_services: [],
      preferred_content_types: [],
      existing_assets: [],
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: SurveyFormData) => {
    setIsSubmitting(true);

    try {
      const { data: submission, error } = await supabase
        .from('content_strategy_submissions')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      setIsSubmitted(true);
      toast.success('Survey submitted successfully!');
      
      // TODO: Trigger email notification here when you have email set up
      
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    'Contact Information',
    'Business Information',
    'Current Situation',
    'Goals & Objectives',
    'Content Preferences',
    'Additional Information',
  ];

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your content strategy survey has been submitted successfully.
          </p>
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-2">What Happens Next?</h2>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                <span>We'll analyze your responses and business needs</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                <span>Create a personalized strategy presentation just for you</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                <span>Send you a custom ROI projection within 48 hours</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">4.</span>
                <span>If you're interested, we'll dive deeper with a discovery call</span>
              </li>
            </ul>
          </div>
          <p className="text-gray-600 mb-6">
            Expect to hear from us within <strong>24-48 hours</strong>.
          </p>
          <Button onClick={() => window.location.href = '/'} size="lg">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Content Strategy Survey
          </h1>
          <p className="text-xl text-gray-600">
            Help us understand your business so we can create a custom strategy
          </p>
          <p className="text-sm text-gray-500 mt-2">Takes about 10-15 minutes</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {sections.map((section, index) => (
              <div
                key={section}
                className={`text-xs ${
                  index === currentSection
                    ? 'text-blue-600 font-semibold'
                    : index < currentSection
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {index < currentSection ? '✓' : index + 1}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Section {currentSection + 1} of {sections.length}: {sections[currentSection]}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-2xl p-8">
          
          {/* SECTION 0: Contact Information */}
          {currentSection === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    {...register('first_name')}
                    placeholder="John"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    {...register('last_name')}
                    placeholder="Smith"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@company.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  {...register('company_name')}
                  placeholder="Your Company LLC"
                />
                {errors.company_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="website_url">Website URL (if you have one)</Label>
                <Input
                  id="website_url"
                  {...register('website_url')}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          )}

          {/* SECTION 1: Business Information */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Business Information</h2>

              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select onValueChange={(value) => setValue('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fitness-wellness">Fitness & Wellness</SelectItem>
                    <SelectItem value="coaching-consulting">Coaching & Consulting</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="beauty-spa">Beauty & Spa</SelectItem>
                    <SelectItem value="professional-services">Professional Services</SelectItem>
                    <SelectItem value="home-services">Home Services</SelectItem>
                    <SelectItem value="retail-ecommerce">Retail & E-commerce</SelectItem>
                    <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                    <SelectItem value="creative-professional">Creative Professional</SelectItem>
                    <SelectItem value="b2b-services">B2B Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="business_description">
                  Describe your business in 2-3 sentences *
                </Label>
                <Textarea
                  id="business_description"
                  {...register('business_description')}
                  placeholder="What does your business do? What products/services do you offer?"
                  rows={4}
                />
                {errors.business_description && (
                  <p className="text-red-500 text-sm mt-1">{errors.business_description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="target_audience">Who is your ideal customer? *</Label>
                <Textarea
                  id="target_audience"
                  {...register('target_audience')}
                  placeholder="Age, demographics, pain points, interests..."
                  rows={3}
                />
                {errors.target_audience && (
                  <p className="text-red-500 text-sm mt-1">{errors.target_audience.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="unique_value">
                  What makes you different from competitors? *
                </Label>
                <Textarea
                  id="unique_value"
                  {...register('unique_value')}
                  placeholder="Your unique selling proposition..."
                  rows={3}
                />
                {errors.unique_value && (
                  <p className="text-red-500 text-sm mt-1">{errors.unique_value.message}</p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: Current Situation */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Current Situation</h2>

              <div>
                <Label htmlFor="biggest_challenge">
                  What's your biggest marketing/content challenge right now? *
                </Label>
                <Textarea
                  id="biggest_challenge"
                  {...register('biggest_challenge')}
                  placeholder="Not enough time, don't know what to post, no strategy, inconsistent posting..."
                  rows={4}
                />
                {errors.biggest_challenge && (
                  <p className="text-red-500 text-sm mt-1">{errors.biggest_challenge.message}</p>
                )}
              </div>

              <div>
                <Label>What marketing are you currently doing? (Check all that apply) *</Label>
                <div className="space-y-2 mt-2">
                  {[
                    'Social Media',
                    'Email Marketing',
                    'Website/Blog',
                    'Paid Advertising',
                    'SEO',
                    'Video Content',
                    'Networking/Events',
                    'Nothing Currently',
                    'Other',
                  ].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`marketing-${option}`}
                        checked={watchedValues.current_marketing?.includes(option)}
                        onCheckedChange={(checked) => {
                          const current = watchedValues.current_marketing || [];
                          if (checked) {
                            setValue('current_marketing', [...current, option]);
                          } else {
                            setValue(
                              'current_marketing',
                              current.filter((item) => item !== option)
                            );
                          }
                        }}
                      />
                      <label htmlFor={`marketing-${option}`} className="cursor-pointer">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.current_marketing && (
                  <p className="text-red-500 text-sm mt-1">{errors.current_marketing.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="current_content_frequency">
                  How often do you currently post content? *
                </Label>
                <Select onValueChange={(value) => setValue('current_content_frequency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="few-times-week">Few times per week</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="few-times-month">Few times per month</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                    <SelectItem value="never">Never/Just Starting</SelectItem>
                  </SelectContent>
                </Select>
                {errors.current_content_frequency && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.current_content_frequency.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="monthly_marketing_budget">
                  What's your monthly marketing budget? *
                </Label>
                <Select onValueChange={(value) => setValue('monthly_marketing_budget', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-500">Under $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                    <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                    <SelectItem value="5000-plus">$5,000+</SelectItem>
                    <SelectItem value="flexible">Flexible/Depends on ROI</SelectItem>
                  </SelectContent>
                </Select>
                {errors.monthly_marketing_budget && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.monthly_marketing_budget.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: Goals & Objectives */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Goals & Objectives</h2>

              <div>
                <Label htmlFor="primary_goal">What's your primary goal? *</Label>
                <Textarea
                  id="primary_goal"
                  {...register('primary_goal')}
                  placeholder="More clients, brand awareness, thought leadership, online presence..."
                  rows={3}
                />
                {errors.primary_goal && (
                  <p className="text-red-500 text-sm mt-1">{errors.primary_goal.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="success_metric">How do you measure success? *</Label>
                <Textarea
                  id="success_metric"
                  {...register('success_metric')}
                  placeholder="New leads, sales, followers, engagement, website traffic..."
                  rows={3}
                />
                {errors.success_metric && (
                  <p className="text-red-500 text-sm mt-1">{errors.success_metric.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="timeline">What's your timeline? *</Label>
                <Select onValueChange={(value) => setValue('timeline', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">ASAP (within 2 weeks)</SelectItem>
                    <SelectItem value="soon">Soon (2-4 weeks)</SelectItem>
                    <SelectItem value="planning">Planning (1-3 months)</SelectItem>
                    <SelectItem value="researching">Just Researching</SelectItem>
                  </SelectContent>
                </Select>
                {errors.timeline && (
                  <p className="text-red-500 text-sm mt-1">{errors.timeline.message}</p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: Content Preferences */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Content Preferences</h2>

              <div>
                <Label>What services are you interested in? (Check all that apply) *</Label>
                <div className="space-y-2 mt-2">
                  {[
                    'Website Design',
                    'Content Creation (Social Media)',
                    'Video Production',
                    'Photography',
                    'CRM Setup & Management',
                    'Brand Strategy',
                    'Email Marketing',
                    'Social Media Management',
                    'Full Package (Everything)',
                  ].map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service}`}
                        checked={watchedValues.interested_services?.includes(service)}
                        onCheckedChange={(checked) => {
                          const current = watchedValues.interested_services || [];
                          if (checked) {
                            setValue('interested_services', [...current, service]);
                          } else {
                            setValue(
                              'interested_services',
                              current.filter((item) => item !== service)
                            );
                          }
                        }}
                      />
                      <label htmlFor={`service-${service}`} className="cursor-pointer">
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.interested_services && (
                  <p className="text-red-500 text-sm mt-1">{errors.interested_services.message}</p>
                )}
              </div>

              <div>
                <Label>What type of content resonates with you? (Check all that apply) *</Label>
                <div className="space-y-2 mt-2">
                  {[
                    'Educational/Tips',
                    'Behind-the-Scenes',
                    'Client Testimonials',
                    'Before/After Results',
                    'Personal Stories',
                    'Industry News/Trends',
                    'Product/Service Showcases',
                    'Live Videos/Q&A',
                  ].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`content-${type}`}
                        checked={watchedValues.preferred_content_types?.includes(type)}
                        onCheckedChange={(checked) => {
                          const current = watchedValues.preferred_content_types || [];
                          if (checked) {
                            setValue('preferred_content_types', [...current, type]);
                          } else {
                            setValue(
                              'preferred_content_types',
                              current.filter((item) => item !== type)
                            );
                          }
                        }}
                      />
                      <label htmlFor={`content-${type}`} className="cursor-pointer">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.preferred_content_types && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.preferred_content_types.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tone_preference">Brand Voice/Tone Preference *</Label>
                <Select onValueChange={(value) => setValue('tone_preference', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional & Corporate</SelectItem>
                    <SelectItem value="friendly">Friendly & Conversational</SelectItem>
                    <SelectItem value="inspirational">Inspirational & Motivational</SelectItem>
                    <SelectItem value="edgy">Edgy & Bold</SelectItem>
                    <SelectItem value="luxury">Luxury & Premium</SelectItem>
                    <SelectItem value="casual">Casual & Fun</SelectItem>
                    <SelectItem value="educational">Educational & Authoritative</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tone_preference && (
                  <p className="text-red-500 text-sm mt-1">{errors.tone_preference.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="competitor_examples">
                  Competitor examples or brands you admire (optional)
                </Label>
                <Textarea
                  id="competitor_examples"
                  {...register('competitor_examples')}
                  placeholder="Website URLs or social media handles..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* SECTION 5: Additional Information */}
          {currentSection === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Additional Information</h2>

              <div>
                <Label>What existing assets do you have? (Check all that apply)</Label>
                <div className="space-y-2 mt-2">
                  {[
                    'Logo',
                    'Brand Colors/Guidelines',
                    'Professional Photos',
                    'Videos',
                    'Website Copy',
                    'Social Media Accounts',
                    'Email List',
                    'Customer Database/CRM',
                    'Nothing Yet',
                  ].map((asset) => (
                    <div key={asset} className="flex items-center space-x-2">
                      <Checkbox
                        id={`asset-${asset}`}
                        checked={watchedValues.existing_assets?.includes(asset)}
                        onCheckedChange={(checked) => {
                          const current = watchedValues.existing_assets || [];
                          if (checked) {
                            setValue('existing_assets', [...current, asset]);
                          } else {
                            setValue(
                              'existing_assets',
                              current.filter((item) => item !== asset)
                            );
                          }
                        }}
                      />
                      <label htmlFor={`asset-${asset}`} className="cursor-pointer">
                        {asset}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="additional_info">
                  Anything else we should know? (optional)
                </Label>
                <Textarea
                  id="additional_info"
                  {...register('additional_info')}
                  placeholder="Any other details, questions, or concerns..."
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold mb-2">📋 Ready to Submit?</h3>
                <p className="text-sm text-gray-700">
                  After you submit, we'll review your responses and create a personalized
                  presentation showing exactly how we can help your business grow. You'll receive it
                  within 24-48 hours.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevSection}
              disabled={currentSection === 0}
            >
              Previous
            </Button>

            {currentSection < sections.length - 1 ? (
              <Button type="button" onClick={nextSection}>
                Next Section
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Survey'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
