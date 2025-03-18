'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/store/selectors';

const UserSliceTest = () => {
  const [loading, setLoading] = useState(true);
  const userState = useUser();
  
  useEffect(() => {
    // Test loading user info on mount
    const init = async () => {
      try {
        await userState.refreshUserInfo();
        console.log('User info loaded successfully');
      } catch (error) {
        console.error('Error loading user info:', error);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [userState.refreshUserInfo]);
  
  const handleUpdatePreferences = () => {
    userState.updateStudyPreferences({
      dailyGoal: Math.floor(Math.random() * 60) + 15, // Random between 15-75 minutes
    });
  };
  
  const handleUpdateInterfaceSettings = () => {
    userState.updateInterfaceSettings({
      darkMode: !userState.interfaceSettings.darkMode,
    });
  };
  
  const handleAddStep = () => {
    userState.addCompletedStep(`step-${Date.now()}`);
  };
  
  return (
    <div className="p-4 border rounded-lg shadow-sm max-w-2xl mx-auto my-8">
      <h2 className="text-xl font-bold mb-4">User Slice Test Component</h2>
      
      {loading ? (
        <div className="text-center py-4">Loading user data...</div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">User Info</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(userState.userInfo, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Profile</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(userState.profile, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Study Preferences</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs">
              {JSON.stringify(userState.studyPreferences, null, 2)}
            </pre>
            <button 
              onClick={handleUpdatePreferences}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Update Study Preferences
            </button>
          </div>
          
          <div>
            <h3 className="font-semibold">Interface Settings</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs">
              {JSON.stringify(userState.interfaceSettings, null, 2)}
            </pre>
            <button 
              onClick={handleUpdateInterfaceSettings}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Toggle Dark Mode
            </button>
          </div>
          
          <div>
            <h3 className="font-semibold">Completed Steps ({userState.completedSteps.length})</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs max-h-40 overflow-auto">
              {JSON.stringify(userState.completedSteps, null, 2)}
            </pre>
            <button 
              onClick={handleAddStep}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Add Random Step
            </button>
          </div>
          
          <div>
            <h3 className="font-semibold">Coins: {userState.coins}</h3>
            <div className="flex space-x-2 mt-2">
              <button 
                onClick={() => userState.updateCoins(10)}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Add 10 Coins
              </button>
              <button 
                onClick={() => userState.updateCoins(-5)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Remove 5 Coins
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold">Subscription Status</h3>
            <div className={`inline-block px-2 py-1 rounded text-sm ${userState.isSubscribed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {userState.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSliceTest; 