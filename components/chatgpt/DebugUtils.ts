/**
 * Creates a comprehensive context object for logging
 */
export const createContextLogObject = (
  userInfo: any,
  isSubscribed: boolean,
  gameState: {
    streakDays: number;
    testScore: number;
    userLevel: string;
    totalPatients: number;
  },
  knowledgeState: {
    weakestConcepts: any[];
    sectionSummaries: any[];
    overallMastery: number;
    isLoading: boolean;
  },
  activities: {
    examActivities: any[];
    studyActivities: any[];
  },
  uiState: {
    currentTheme: string;
    audioEnabled: boolean;
  },
  welcomeState: {
    welcomeMessage: string | null;
    welcomeVisible: boolean;
    isWelcomeMessageTemporary: boolean;
  }
) => {
  // Collect all context in one object for easier debugging
  return {
    user: {
      userInfo,
      isSubscribed,
    },
    game: {
      streakDays: gameState.streakDays,
      testScore: gameState.testScore,
      userLevel: gameState.userLevel,
      totalPatients: gameState.totalPatients
    },
    knowledge: {
      weakestConcepts: knowledgeState.weakestConcepts?.length ? 
        `${knowledgeState.weakestConcepts.length} items` : 'none',
      sectionSummaries: knowledgeState.sectionSummaries?.length ? 
        `${knowledgeState.sectionSummaries.length} items` : 'none',
      overallMastery: knowledgeState.overallMastery || 0,
      loading: knowledgeState.isLoading
    },
    activities: {
      examActivities: activities.examActivities?.length ? 
        `${activities.examActivities.length} items` : 'none',
      studyActivities: activities.studyActivities?.length ? 
        `${activities.studyActivities.length} items` : 'none',
    },
    ui: {
      currentTheme: uiState.currentTheme,
      audioEnabled: uiState.audioEnabled,
    },
    welcomeState: {
      welcomeMessage: welcomeState.welcomeMessage ? 'exists' : 'none',
      welcomeVisible: welcomeState.welcomeVisible,
      isWelcomeMessageTemporary: welcomeState.isWelcomeMessageTemporary
    }
  };
};

/**
 * Logs detailed context and sample data for debugging
 */
export const logDebugData = (
  contextObject: any,
  sampleData: {
    examActivity?: any;
    studyActivity?: any;
    userInfo?: any;
    weakestConcept?: any;
    sectionSummary?: any;
    knowledgeSummary?: any;
  } = {}
) => {
  console.log('ChatContainer Context:', contextObject);
  
  // Log knowledge summary for welcome message if available
  if (sampleData.knowledgeSummary) {
    console.log(
      'Welcome Message Knowledge Summary:', 
      sampleData.knowledgeSummary.welcomeMessageSummary
    );
    console.log('Knowledge Detailed Stats:', sampleData.knowledgeSummary.detailedStats);
  }
  
  // Log sample of full data (first item only to avoid console clutter)
  if (sampleData.examActivity) {
    console.log('Sample Exam Activity:', sampleData.examActivity);
  }
  
  if (sampleData.studyActivity) {
    console.log('Sample Study Activity:', sampleData.studyActivity);
  }
  
  if (sampleData.userInfo) {
    console.log('Full User Info:', sampleData.userInfo);
  }
  
  if (sampleData.weakestConcept) {
    console.log('Sample Weakest Concept:', sampleData.weakestConcept);
  }
  
  if (sampleData.sectionSummary) {
    console.log('Sample Section Summary:', sampleData.sectionSummary);
  }
}; 