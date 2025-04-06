import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { handleUpdateKnowledgeProfile } from '@/components/util/apiHandlers';

//========================= Types ===============================
interface SectionSummary {
  section: string;
  averageMastery: number;
  totalConcepts: number;
}

interface WeakConcept {
  subject: string;
  content: string;
  concept: string;
  mastery: number;
  section: string;
}

interface KnowledgeState {
  // Raw data from API
  sections: Record<string, any[]>;
  sectionSummaries: SectionSummary[];
  weakestConcepts: WeakConcept[];
  
  // Status
  isLoading: boolean;
  lastFetched: Date | null;
  error: string | null;
}

interface KnowledgeActions {
  fetchKnowledgeProfiles: () => Promise<void>;
  resetKnowledgeProfiles: () => void;
  checkAndUpdateKnowledgeProfiles: (userId: string) => Promise<void>;
}

//========================= Helpers ===============================
const KNOWLEDGE_UPDATE_KEY = 'knowledge-profile-last-update';
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

//========================= Store Creation ===============================
export const useKnowledgeStore = create<KnowledgeState & KnowledgeActions>()(
  devtools((set, get) => ({
    // Initial state
    sections: {},
    sectionSummaries: [],
    weakestConcepts: [],
    isLoading: false,
    lastFetched: null,
    error: null,
    
    // Actions
    fetchKnowledgeProfiles: async () => {
      // Skip if recently fetched (5 minutes cache)
      const lastFetched = get().lastFetched;
      if (lastFetched && (new Date().getTime() - lastFetched.getTime() < 5 * 60 * 1000)) {
        console.log('[Knowledge] Using cached data from', lastFetched);
        return;
      }
      
      set({ isLoading: true, error: null });
      try {
        console.log('[Knowledge] Fetching knowledge profiles...');
        const response = await fetch('/api/knowledge-profile');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch knowledge profiles: ${response.status}`);
        }
        
        const data = await response.json();
        
        set({ 
          sections: data.sections || {},
          sectionSummaries: data.sectionSummaries || [], 
          weakestConcepts: data.weakestConcepts || [],
          isLoading: false,
          lastFetched: new Date(),
          error: null
        });
        
      } catch (error) {
        console.error('[Knowledge] Error fetching knowledge profiles:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Unknown error fetching knowledge profiles'
        });
      }
    },
    
    resetKnowledgeProfiles: () => {
      console.log('[Knowledge] Resetting knowledge profiles');
      set({ 
        sections: {},
        sectionSummaries: [], 
        weakestConcepts: [],
        lastFetched: null,
        error: null
      });
    },

    checkAndUpdateKnowledgeProfiles: async (userId: string) => {
      if (!userId) {
        console.log('[Knowledge] No user ID provided, skipping update check');
        return;
      }

      try {
        // Get last update time from localStorage
        const storageKey = `${KNOWLEDGE_UPDATE_KEY}-${userId}`;
        const lastUpdateString = localStorage.getItem(storageKey);
        const now = new Date().getTime();
        
        // Check if we need to update
        let needsUpdate = true;
        
        if (lastUpdateString) {
          const lastUpdate = parseInt(lastUpdateString, 10);
          const timeSinceLastUpdate = now - lastUpdate;
          
          // Only update if it's been more than 24 hours
          needsUpdate = timeSinceLastUpdate > MILLISECONDS_PER_DAY;
          
          console.log(
            `[Knowledge] Last profile update: ${new Date(lastUpdate).toLocaleString()}, ` + 
            `${needsUpdate ? 'needs update' : 'update not needed yet'}`
          );
        } else {
          console.log('[Knowledge] No previous update recorded, will update profiles');
        }
        
        if (needsUpdate) {
          console.log('[Knowledge] Updating knowledge profiles in background...');
          
          // Fire and forget - we don't want to block the UI
          handleUpdateKnowledgeProfile().then(() => {
            // Update localStorage with current timestamp after successful update
            localStorage.setItem(storageKey, now.toString());
            console.log('[Knowledge] Profile update completed and timestamp saved');
            
            // Refresh the profiles to get the new data
            get().fetchKnowledgeProfiles();
          }).catch(error => {
            console.error('[Knowledge] Error in background update:', error);
          });
        }
      } catch (error) {
        console.error('[Knowledge] Error checking update status:', error);
      }
    }
  }))
); 