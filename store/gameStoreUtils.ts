// Game-specific calculation functions for the Zustand store

export const tierRooms = [
  "PATIENT LEVEL",
  "INTERN LEVEL",
  "RESIDENT LEVEL",
  "FELLOWSHIP LEVEL",
  "ATTENDING LEVEL",
  "PHYSICIAN LEVEL",
  "MEDICAL DIRECTOR LEVEL"
];

/**
 * Calculates the player's level based on their owned rooms
 * Checks from highest to lowest tier and returns the highest tier found
 */
export const calculatePlayerLevel = (userRooms: string[]): string => {
  for (let i = tierRooms.length - 1; i >= 0; i--) {
    if (userRooms.includes(tierRooms[i])) {
      return tierRooms[i];
    }
  }
  
  return "PATIENT LEVEL";
};

/**
 * Gets the numeric level index from a level string
 */
export const getLevelNumber = (levelString: string): number => {
  const index = tierRooms.indexOf(levelString);
  return index === -1 ? 0 : index;
};

/**
 * Returns the number of patients per day based on player level
 */
export const getPatientsPerDay = (playerLevel: number): number => {
  const patientsMap: { [level: number]: number } = {
    0: 0,   // PATIENT LEVEL
    1: 4,   // INTERN LEVEL
    2: 8,   // RESIDENT LEVEL
    3: 10,  // FELLOWSHIP LEVEL
    4: 16,  // ATTENDING LEVEL
    5: 24,  // PHYSICIAN LEVEL
    6: 30,  // MEDICAL DIRECTOR LEVEL
  };

  return patientsMap[playerLevel] || 0;
};

/**
 * Calculates the total Quality of Care based on player level and streak days
 */
export const calculateTotalQC = (playerLevel: number, streakDays: number): number => {
  const levelQCValues: { [level: number]: number } = {
    0: 0.5, // PATIENT LEVEL
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

  const levelQC = levelQCValues[playerLevel] || 0.5;
  const streakQC = streakDays >= 14 ? 2.5 : (streakModifiers[streakDays] || 1.0);

  return levelQC + streakQC;
};

/**
 * Returns the clinic cost per day based on player level
 */
export const getClinicCostPerDay = (playerLevel: number): number => {
  return 0;  // Remove daily costs while keeping initial unlock costs
};

/**
 * Calculates the Quality of Care based on user rooms
 */
export const calculateQualityOfCare = (userRooms: string[]): number => {
  const playerLevel = getLevelNumber(calculatePlayerLevel(userRooms));
  const levelQCValues: { [level: number]: number } = {
    0: 0.5, // PATIENT LEVEL
    1: 1.0,
    2: 1.25,
    3: 1.5,
    4: 1.5,
    5: 1.75,
    6: 2.0,
  };

  return levelQCValues[playerLevel] || 0.5;
}; 