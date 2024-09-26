'use client';

import React, { useState, useEffect } from 'react';
import ResourcesMenu from './ResourcesMenu';
import OfficeContainer from './OfficeContainer';
import FloatingButton from '../home/FloatingButton';
import ShoppingDialog, { ImageGroup } from './ShoppingDialog';
import { useRouter } from 'next/navigation';
import { DoctorOfficeStats } from '@/types';
import { toast } from 'react-hot-toast';

const DoctorsOfficePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('doctorsoffice');
  const [userLevel, setUserLevel] = useState('');
  const [userScore, setUserScore] = useState(0);
  const [patientsPerDay, setPatientsPerDay] = useState(4); // Default value
  const router = useRouter();
  const [userRooms, setUserRooms] = useState<string[]>([]);

  // Add this state for clinic name
  const [clinicName, setClinicName] = useState<string | null>(null);

  // Marketplace State
  const [imageGroups, setImageGroups] = useState<ImageGroup[]>([
    {
      name: 'INTERN LEVEL',
      items: [
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png' },
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png' },
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png' },
      ],
      cost: 5,
      benefits: [
        '4 patients a day',
        '1 cupcake coin a day',
        'Quality of Care (QC) = 1x',
        'You are an intern learning the ropes.',
      ],
    },
    {
      name: 'RESIDENT LEVEL',
      items: [
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png' },
        { id: 'Bathroom1', src: '/game-components/Bathroom1.png' },
        { id: 'Bathroom2', src: '/game-components/Bathroom1.png' },
      ],
      cost: 15,
      benefits: [
        '8 patients a day',
        '1 cupcake coin a day',
        'Quality of Care (QC) = 1.25x',
        'You are a doctor in training with Kalypso.',
      ],
    },
    {
      name: 'FELLOWSHIP LEVEL',
      items: [
        { id: 'HighCare1', src: '/game-components/HighCare1.png' },
        { id: 'HighCare2', src: '/game-components/HighCare1.png' },
      ],
      cost: 25,
      benefits: [
        '10 patients a day',
        '2 cupcake coins a day',
        'Quality of Care (QC) = 1.5x',
        'You are a physician.',
      ],
    },
    {
      name: 'ATTENDING LEVEL',
      items: [
        { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png' },
        { id: 'MedicalCloset1', src: '/game-components/MedicalCloset1.png' },
        { id: 'MRIMachine2', src: '/game-components/MRIMachine.png' },
      ],
      cost: 35,
      benefits: [
        'Quality of Care (QC) = 1.5x',
        '2 cupcake coins a day',
        'You can do surgeries.',
      ],
    },
    {
      name: 'PHYSICIAN LEVEL',
      items: [
        { id: 'MRIMachine1', src: '/game-components/MRIMachine.png' },
      ],
      cost: 60,
      benefits: [
        'Quality of Care (QC) = 1.75x',
        '3 cupcake coins a day',
        'You can lead teams.',
        'UWorld Raffle Entry ($400 value)',
      ],
    },
    {
      name: 'MEDICAL DIRECTOR LEVEL',
      items: [
        { id: 'CATScan1', src: '/game-components/CATScan1.png' },
        { id: 'CATScan2', src: '/game-components/CATScan1.png' },
      ],
      cost: 80,
      benefits: [
        'Quality of Care (QC) = 2x',
        '3 cupcake coins a day',
        'You are now renowned.',
        '30 min tutoring session.',
      ],
    },
    {
      name: 'Team Vacation',
      items: [],
      cost: 1,
      benefits: ['Can take a break tomorrow and save your streak.'],
    },
    {
      name: 'Free Clinic Day',
      items: [],
      cost: 5,
      benefits: ['Treat 50 patients', 'Double your chances of a 5-star review!'],
    },
    {
      name: 'University Sponsorship',
      items: [],
      cost: 20,
      benefits: ['2x boost your value for university in a day'],
    },
  ]);

  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());

  const toggleGroup = async (groupName: string) => {
    const group = imageGroups.find(g => g.name === groupName);
    if (!group) return;

    const allVisible = group.items.every(item => visibleImages.has(item.id));

    if (allVisible) {
      // Selling logic
      try {
        const response = await fetch('/api/clinic', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room: groupName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove clinic room');
        }

        const { rooms: updatedRooms, score: updatedScore } = await response.json();
        setUserRooms(updatedRooms);
        setUserScore(updatedScore);
        setVisibleImages(prev => {
          const newSet = new Set(prev);
          group.items.forEach(item => newSet.delete(item.id));
          return newSet;
        });

        toast.success(`Removed ${groupName} from your clinic!`);
      } catch (error) {
        console.error('Error removing clinic room:', error);
        toast.error((error as Error).message || 'Failed to remove clinic room');
      }
    } else {
      // Buying logic
      if (userScore < group.cost) {
        toast.error(`Insufficient funds. You need ${group.cost} coins to buy ${groupName}.`);
        return;
      }

      try {
        const response = await fetch('/api/clinic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room: groupName, cost: group.cost }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update clinic rooms');
        }

        const { rooms: updatedRooms, score: updatedScore } = await response.json();
        setUserRooms(updatedRooms);
        setUserScore(updatedScore);
        setVisibleImages(prev => {
          const newSet = new Set(prev);
          group.items.forEach(item => newSet.add(item.id));
          return newSet;
        });

        toast.success(`Added ${groupName} to your clinic!`);
      } catch (error) {
        console.error('Error updating clinic rooms:', error);
        toast.error((error as Error).message || 'Failed to update clinic rooms');
      }
    }
  };

  useEffect(() => {
    const fetchUserLevel = async () => {
      try {
        const response = await fetch('/api/clinic');
        if (response.ok) {
          const rooms = await response.json();
          const highestLevel = rooms.reduce((highest: string, room: string) => {
            const levels = [
              'INTERN LEVEL',
              'RESIDENT LEVEL',
              'FELLOWSHIP LEVEL',
              'ATTENDING LEVEL',
              'PHYSICIAN LEVEL',
              'MEDICAL DIRECTOR LEVEL',
            ];
            const currentIndex = levels.indexOf(room);
            const highestIndex = levels.indexOf(highest);
            return currentIndex > highestIndex ? room : highest;
          }, '');
          setUserLevel(highestLevel || 'INTERN LEVEL');
        }
      } catch (error) {
        console.error('Failed to fetch user level:', error);
      }
    };

    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user-info');
        if (response.ok) {
          const data = await response.json();
          setUserScore(data.score || 0);
          setPatientsPerDay(data.patientsPerDay || 4);
          setClinicName(data.clinicName || null);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    const fetchUserRooms = async () => {
      try {
        const response = await fetch('/api/clinic', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user rooms');
        }

        const rooms = await response.json();
        const newVisibleImages = new Set<string>();
        rooms.forEach((roomName: string) => {
          const group = imageGroups.find((g) => g.name === roomName);
          if (group) {
            group.items.forEach((item) => newVisibleImages.add(item.id));
          }
        });
        setVisibleImages(newVisibleImages);
      } catch (error) {
        console.error('Error fetching user rooms:', error);
      }
    };

    fetchUserLevel();
    fetchUserInfo();
    fetchUserRooms();
  }, [imageGroups]);

  const handleTabChange = (tab: string) => {
    if (tab !== 'doctorsoffice') {
      router.push(`/home?tab=${tab}`);
    }
    setActiveTab(tab);
  };

  // Add this function to update user score
  const handleUpdateUserScore = (newScore: number) => {
    setUserScore(newScore);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[4rem] flex bg-transparent text-[--theme-text-color] p-4">
      <div className="flex w-full h-full max-w-full max-h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] rounded-lg overflow-hidden">
        <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak]">
          <ResourcesMenu />
        </div>
        <div className="w-3/4 font-krungthep relative rounded-r-lg">
          <OfficeContainer 
            visibleImages={visibleImages}
            clinicName={clinicName}
            userScore={userScore}
            userRooms={userRooms}
            imageGroups={imageGroups}
            toggleGroup={toggleGroup}
            onUpdateUserScore={handleUpdateUserScore}
          />
          {/* Fellowship Level button with coins and patients */}
          <div className="absolute top-4 right-4 z-50 flex items-center">
            {/* Coins display */}
            <div className="flex items-center bg-opacity-75 bg-gray-800 rounded-lg p-2 mr-2">
              <img src="/game-components/PixelCupcake.png" alt="Coin" className="w-8 h-8 mr-2" />
              <span className="text-[--theme-text-color] font-bold">{userScore}</span>
            </div>
            {/* Patients display */}
            <div className="flex items-center bg-opacity-75 bg-gray-800 rounded-lg p-2 mr-2">
              <img src="/game-components/patient.png" alt="Patient" className="w-8 h-8 mr-2" />
              <span className="text-[--theme-text-color] font-bold">{patientsPerDay}</span>
            </div>
            {/* Fellowship Level button with dropdown */}
            <div className="relative group">
              <button className="flex items-center justify-center px-6 py-3 bg-[--theme-doctorsoffice-accent] border-2 border-[--theme-border-color] text-[--theme-text-color] rounded-md hover:text-[--theme-hover-text] hover:bg-[--theme-hover-color] transition-colors text-3xl font-bold uppercase group-hover:text-[--theme-hover-text] group-hover:bg-[--theme-hover-color]">
                <span>{userLevel || 'FELLOWSHIP LEVEL'}</span>
              </button>
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                <div className="py-1">
                  <ShoppingDialog
                    imageGroups={imageGroups}
                    visibleImages={visibleImages}
                    toggleGroup={toggleGroup}
                    userScore={userScore}
                    buttonContent={
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Marketplace</a>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4">
        <FloatingButton
          onTabChange={handleTabChange}
          currentPage="doctorsoffice"
          initialTab={activeTab}
        />
      </div>
    </div>
  );
};

export default DoctorsOfficePage;
