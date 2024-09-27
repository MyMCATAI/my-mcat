export const calculatePlayerLevel = (userRooms: string[]): number => {
  const tierRooms = [
    "INTERN LEVEL",
    "RESIDENT LEVEL",
    "FELLOWSHIP LEVEL",
    "ATTENDING LEVEL",
    "PHYSICIAN LEVEL",
    "MEDICAL DIRECTOR LEVEL"
  ];
  
  console.log("User Rooms:", userRooms);
  
  let highestLevel = -1;
  for (let i = tierRooms.length - 1; i >= 0; i--) {
    if (userRooms.includes(tierRooms[i])) {
      highestLevel = i;
      break;
    }
  }
  
  console.log("Highest Level Index:", highestLevel);
  
  const calculatedLevel = highestLevel === -1 ? 1 : highestLevel + 1;
  console.log("Calculated Level:", calculatedLevel);
  
  return calculatedLevel;
};

export const getPatientsPerDay = (playerLevel: number): number => {
  const patientsMap: { [level: number]: number } = {
    1: 4,   // INTERN LEVEL
    2: 8,   // RESIDENT LEVEL
    3: 10,  // FELLOWSHIP LEVEL
    4: 16,  // ATTENDING LEVEL
    5: 24,  // PHYSICIAN LEVEL
    6: 30,  // MEDICAL DIRECTOR LEVEL
  };

  return patientsMap[playerLevel] || 4; // Default to 4 if level not found
};

export const calculateTotalQC = (playerLevel: number, streakDays: number): number => {
  // Level QC values based on player level (max 2.0)
  const levelQCValues: { [level: number]: number } = {
    1: 1.0,
    2: 1.2,
    3: 1.4,
    4: 1.6,
    5: 1.8,
    6: 2.0,
  };

  // Streak modifier values based on streak days (max 2.5)
  const streakModifiers: { [days: number]: number } = {
    1: 1.0,
    2: 1.1,
    3: 1.2,
    4: 1.3,
    5: 1.4,
    6: 1.5,
    7: 2.0,  // Bigger jump at 7 days
    8: 2.1,
    9: 2.2,
    10: 2.3,
    11: 2.4,
    12: 2.5,
    13: 2.5,
    14: 2.5,
  };

  const levelQC = levelQCValues[playerLevel] || 1.0;
  const streakQC = streakDays >= 14 ? 2.5 : (streakModifiers[streakDays] || 1.0);

  // Total QC is the sum of Level QC and Streak QC
  return levelQC + streakQC;
};

export const getClinicCostPerDay = (playerLevel: number): number => {
  if (playerLevel <= 2) return 1;  // INTERN and RESIDENT LEVEL
  if (playerLevel <= 4) return 2;  // FELLOWSHIP and ATTENDING LEVEL
  return 3;  // PHYSICIAN and MEDICAL DIRECTOR LEVEL
};
