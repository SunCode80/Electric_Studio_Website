// Pipeline Types for Electric Studio Admin Portal
// These match the existing Cursor admin-presentation-portal types

export interface S1SurveyData {
  // Client Information
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  
  // Business Details
  industry: string;
  businessDescription: string;
  targetAudience: string;
  uniqueSellingPoints: string[];
  competitors?: string[];
  
  // Goals & Objectives
  primaryGoals: string[];
  timeline: string;
  budget?: string;
  
  // Content Preferences
  interestedServices: string[];
  preferredContentTypes: string[];
  tonePreference: string;
  existingAssets?: string;
  
  // Additional
  additionalInfo?: string;
  submittedAt: string;
}

export interface S2PresentationData {
  clientName: string;
  businessName: string;
  generatedAt: string;
  
  // Executive Summary
  executiveSummary: {
    overview: string;
    keyOpportunities: string[];
    recommendedApproach: string;
  };
  
  // Market Analysis
  marketAnalysis: {
    industryOverview: string;
    targetAudienceInsights: string;
    competitorAnalysis: string;
    opportunities: string[];
  };
  
  // Strategy Recommendations
  strategy: {
    brandPositioning: string;
    contentPillars: string[];
    channelStrategy: string[];
    keyMessages: string[];
  };
  
  // Proposed Services
  proposedServices: {
    service: string;
    description: string;
    deliverables: string[];
    timeline: string;
  }[];
  
  // Investment & Timeline
  investment: {
    packages: {
      name: string;
      price: string;
      includes: string[];
    }[];
    timeline: string;
    nextSteps: string[];
  };
}

export interface S3VideoProductionData {
  projectName: string;
  clientPrefix: string;
  generatedAt: string;
  
  // Video Segments
  segments: {
    segmentNumber: number;
    title: string;
    duration: string;
    description: string;
    
    // Layers
    layers: {
      layerNumber: number;
      type: 'video' | 'audio' | 'graphics' | 'text';
      assetName: string;
      description: string;
      timing: string;
      notes: string;
    }[];
  }[];
  
  // Asset Manifest
  assetManifest: {
    videos: AssetItem[];
    audio: AssetItem[];
    graphics: AssetItem[];
    photos: AssetItem[];
  };
  
  // Production Notes
  productionNotes: {
    styleGuide: string;
    colorPalette: string[];
    fontRecommendations: string[];
    moodBoard: string;
  };
}

export interface AssetItem {
  filename: string;
  description: string;
  specifications: string;
  aiPrompt?: string;
}

export interface S4AssemblyData {
  projectName: string;
  generatedAt: string;
  
  // Assembly Instructions
  assemblySteps: {
    stepNumber: number;
    title: string;
    description: string;
    assets: string[];
    technicalNotes: string;
    duration: string;
  }[];
  
  // Timeline Structure
  timeline: {
    segment: string;
    startTime: string;
    endTime: string;
    layers: string[];
  }[];
  
  // Export Settings
  exportSettings: {
    format: string;
    resolution: string;
    frameRate: string;
    codec: string;
    additionalFormats: string[];
  };
  
  // Quality Checklist
  qualityChecklist: {
    item: string;
    category: string;
    required: boolean;
  }[];
}

export interface S5MasterGuide {
  projectName: string;
  clientName: string;
  generatedAt: string;
  version: string;
  
  // Complete compiled document
  sections: {
    title: string;
    content: string;
    subsections?: {
      title: string;
      content: string;
    }[];
  }[];
  
  // References back to source stages
  sourceData: {
    s1: S1SurveyData;
    s2: S2PresentationData;
    s3: S3VideoProductionData;
    s4: S4AssemblyData;
  };
}

export interface Project {
  id: string;
  clientName: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'in-progress' | 'completed';
  
  // Stage completion tracking
  stages: {
    s1: { completed: boolean; data?: S1SurveyData };
    s2: { completed: boolean; data?: S2PresentationData };
    s3: { completed: boolean; data?: S3VideoProductionData };
    s4: { completed: boolean; data?: S4AssemblyData };
    s5: { completed: boolean; pdfUrl?: string };
  };
}

export type StageStatus = 'pending' | 'generating' | 'completed' | 'error';

export interface StageState {
  status: StageStatus;
  progress?: number;
  error?: string;
  data?: unknown;
}
