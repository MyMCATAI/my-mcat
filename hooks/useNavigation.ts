import { useRouter } from 'next/router';
import { useUIStore } from '@/store/slices/uiSlice';

/**
 * A hook that provides navigation utilities with global state tracking
 * for consistent awareness of user navigation and context throughout the app.
 */
export function useNavigation() {
  const router = useRouter();
  const setNavigation = useUIStore(state => state.setNavigation);
  const updateSubSection = useUIStore(state => state.updateSubSection);
  const clearNavigation = useUIStore(state => state.clearNavigation);
  const currentNavigation = useUIStore(state => state.navigation);
  
  /**
   * Navigate to a main route with URL change and state update
   */
  const navigateTo = (route: string, subSection: Record<string, any> = {}) => {
    router.push(route);
    setNavigation(route, subSection);
  };
  
  /**
   * Update subsection without changing URL or page
   */
  const updateSection = (subSectionData: Record<string, any>) => {
    updateSubSection(subSectionData);
  };
  
  /**
   * Navigate to Home Dashboard with context
   */
  const navigateHome = (activeTab: string = 'Summary') => {
    router.push('/home');
    setNavigation('/home', {
      activeTab
    });
  };
  
  /**
   * Navigate to Kalypso AI with context
   */
  const navigateKalypsoAI = () => {
    router.push('/kalypsoai');
    setNavigation('/kalypsoai', {});
  };
  
  /**
   * Navigate to Practice Tests with context
   */
  const navigatePracticeTests = (testId: string = '') => {
    router.push('/practice-tests');
    setNavigation('/practice-tests', {
      activeTestId: testId
    });
  };
  
  /**
   * Navigate to ATS (Tutoring Suite) with context
   */
  const navigateATS = (concept: string, contentType: string, contentId?: string) => {
    router.push('/tutoring-suite');
    
    setNavigation('/tutoring-suite', {
      concept,
      contentType,
      contentId
    });
  };
  
  /**
   * Navigate to CARS Suite with context
   */
  const navigateCARS = (passageId: string, passageTitle: string, testMode: boolean = true) => {
    router.push('/cars-suite');
    
    setNavigation('/cars-suite', {
      testMode,
      passageId,
      passageTitle,
      currentQuestion: 1
    });
  };
  
  /**
   * Navigate to Anki Clinic (Flashcards) with context
   */
  const navigateAnkiClinic = (currentDeck: string, deckCategory: string) => {
    router.push('/ankiclinic');
    
    setNavigation('/ankiclinic', {
      currentDeck,
      deckCategory,
      cardIndex: 0,
      cardState: 'question'
    });
  };
  
  /**
   * Navigate to Test/Quiz with context
   */
  const navigateTest = (testId: string, testType: string, subject: string) => {
    router.push('/test');
    
    setNavigation('/test', {
      testId,
      testType,
      subject,
      currentSection: '',
      questionNumber: 1
    });
  };
  
  /**
   * Navigate to User Test Review with context
   */
  const navigateTestReview = (testId: string, score: number) => {
    router.push('/user-test');
    
    setNavigation('/user-test', {
      testId,
      viewMode: 'review',
      score,
      questionIndex: 0
    });
  };
  
  /**
   * Navigate to Doctor's Office (Settings/Profile) with context
   */
  const navigateSettings = (activeSection: string = 'profile') => {
    router.push('/settings');
    
    setNavigation('/settings', {
      activeSection
    });
  };
  
  /**
   * Navigate to Pricing/Subscription with context
   */
  const navigatePricing = (viewingPlan: string = 'premium') => {
    router.push('/pricing');
    
    setNavigation('/pricing', {
      viewingPlan
    });
  };
  
  /**
   * Navigate to Blog/Resources with context
   */
  const navigateBlog = (category: string = '', articleId: string = '') => {
    router.push('/blog');
    
    setNavigation('/blog', {
      category,
      articleId
    });
  };
  
  /**
   * Navigate to Onboarding with context
   */
  const navigateOnboarding = (step: number, totalSteps: number = 5) => {
    router.push('/onboarding');
    
    setNavigation('/onboarding', {
      step,
      totalSteps
    });
  };
  
  return {
    navigateTo,
    updateSection,
    navigateHome,
    navigateKalypsoAI,
    navigatePracticeTests,
    navigateATS,
    navigateCARS,
    navigateAnkiClinic,
    navigateTest,
    navigateTestReview,
    navigateSettings,
    navigatePricing,
    navigateBlog,
    navigateOnboarding,
    currentNavigation
  };
} 