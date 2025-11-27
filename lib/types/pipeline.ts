export interface S1SurveyData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  industry: string;
  businessDescription: string;
  targetAudience: string;
  uniqueSellingPoints: string[];
  competitors: string[];
  primaryGoals: string[];
  timeline: string;
  budget: string;
  interestedServices: string[];
  preferredContentTypes: string[];
  tonePreference: string;
  existingAssets?: string;
  additionalInfo?: string;
  submittedAt: string;
}

export interface S2PresentationData {
  projectOverview: {
    businessName: string;
    industry: string;
    targetAudience: string;
    objectives: string[];
  };
  strategyRecommendations: {
    contentPillars: string[];
    platforms: string[];
    postingFrequency: string;
    contentMix: Record<string, string>;
  };
  deliverables: {
    category: string;
    items: string[];
    timeline: string;
  }[];
  timeline: {
    phase: string;
    duration: string;
    milestones: string[];
  }[];
  investment: {
    packageName: string;
    totalInvestment: string;
    breakdown: Record<string, string>;
    paymentTerms: string;
  };
  nextSteps: string[];
  generatedAt: string;
}

export interface S3VideoProductionData {
  videoProjects: {
    projectId: string;
    title: string;
    type: string;
    platform: string;
    duration: string;
    objective: string;
    targetAudience: string;
    keyMessages: string[];
    visualStyle: string;
    tone: string;
    shootRequirements: {
      location: string;
      equipment: string[];
      talent: string;
      props: string[];
      duration: string;
    };
    scriptOutline: {
      scene: string;
      duration: string;
      description: string;
      dialogue?: string;
      visuals: string;
      audio: string;
    }[];
    postProduction: {
      editing: string[];
      graphics: string[];
      music: string;
      colorGrading: string;
      callToAction: string;
    };
    deliverySpecs: {
      format: string;
      resolution: string;
      aspectRatio: string;
      frameRate: string;
      codec: string;
    };
  }[];
  productionSchedule: {
    phase: string;
    tasks: string[];
    duration: string;
    deadline: string;
  }[];
  generatedAt: string;
}

export interface S4AssemblyData {
  assemblyGuides: {
    deliverableId: string;
    deliverableName: string;
    type: string;
    priority: string;
    assets: {
      assetId: string;
      assetType: string;
      description: string;
      source: string;
      specifications: Record<string, string>;
    }[];
    assemblySteps: {
      stepNumber: number;
      instruction: string;
      tools: string[];
      estimatedTime: string;
      qualityChecks: string[];
    }[];
    technicalRequirements: {
      software: string[];
      hardware: string[];
      skills: string[];
    };
    qualityStandards: {
      criterion: string;
      requirement: string;
      verification: string;
    }[];
    deliveryFormat: {
      format: string;
      specifications: Record<string, string>;
      naming: string;
    };
  }[];
  productionChecklist: {
    category: string;
    items: {
      task: string;
      assignedTo: string;
      deadline: string;
      status: string;
    }[];
  }[];
  generatedAt: string;
}

export interface S5MasterGuide {
  projectSummary: {
    clientName: string;
    projectName: string;
    industry: string;
    objectives: string[];
    timeline: string;
    budget: string;
  };
  contentStrategy: {
    brandVoice: string;
    visualIdentity: string;
    contentPillars: string[];
    platforms: Record<string, any>;
  };
  allDeliverables: {
    category: string;
    items: {
      name: string;
      description: string;
      format: string;
      specifications: Record<string, string>;
      deadline: string;
      status: string;
    }[];
  }[];
  productionWorkflow: {
    phase: string;
    deliverables: string[];
    dependencies: string[];
    timeline: string;
    team: string[];
  }[];
  qualityAssurance: {
    checkpoint: string;
    criteria: string[];
    approver: string;
    timing: string;
  }[];
  clientCommunication: {
    milestone: string;
    communication: string;
    deliverables: string[];
    format: string;
  }[];
  launchPlan: {
    platform: string;
    content: string[];
    schedule: string;
    metrics: string[];
  }[];
  handoffPackage: {
    component: string;
    contents: string[];
    format: string;
    recipient: string;
  }[];
  generatedAt: string;
}

export interface Project {
  id: string;
  clientName: string;
  status: 'active' | 'completed' | 'on-hold';
  currentStage: 's1' | 's2' | 's3' | 's4' | 's5';
  s1Data?: S1SurveyData;
  s2Data?: S2PresentationData;
  s3Data?: S3VideoProductionData;
  s4Data?: S4AssemblyData;
  s5Data?: S5MasterGuide;
  createdAt: string;
  updatedAt: string;
}
