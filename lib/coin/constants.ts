export const ATS_ANKI_COIN_REWARDS = {
    REALLY_BAD: -1,  // 0-30%
    BAD: 1,         // 30-50%
    OKAY: 2,        // 50-70%
    GOOD: 3,        // 70-99%
    GREAT: 4        // 100%
} as const;

export const ATS_ANKI_THRESHOLDS = {
    REALLY_BAD: 30, // 0-30%
    BAD: 50, // 30-50%
    OKAY: 70, // 50-70%
    GOOD: 99, // 70-99%
    GREAT: 100 // 100%
} as const;

export const CARS_COIN_REWARDS = {
    REALLY_BAD: 0,  // 0-40%
    BAD: 1,         // 40-60%
    GOOD: 2,        // 60-99%
    GREAT: 3        // 100%
} as const;

export const CARS_THRESHOLDS = {
    REALLY_BAD: 20,
    BAD: 60,
    GOOD: 90,
    GREAT: 100
} as const;

export const TASK_REWARDS = {
    COMPLETE_TASK: 1,
    COMPLETE_REVIEW: 2,
    COMPLETE_ATS_TOPIC: 1
} as const;

export const STREAK_REWARDS = {
    SEVEN_DAYS: 1,
    TWENTY_ONE_DAYS: 2
} as const;

export const PENALTY_COSTS = {
    START_ANKI_CLINIC: -2,
    START_ATS_QUIZ: -2,
    MISSED_DAY: -1,
    MISSED_WEEK: -5
} as const;

export const SYSTEM_CONSTANTS = {
    COIN_FLOOR: 10,  // Minimum coins a user can have
    DAILY_CHECK_REQUIRED: true, // Whether to check daily activity
    WEEKLY_CHECK_REQUIRED: true // Whether to check weekly activity
} as const;

// New absence penalty system
export const ABSENCE_PENALTIES = {
    DAILY: {
        AMOUNT: -1,
        REQUIRES_TASKS: true, // Only apply if user has tasks scheduled
        FLOOR_PROTECTED: true // Don't go below floor
    },
    WEEKLY: {
        AMOUNT: -5,
        REQUIRES_TASKS: true,
        FLOOR_PROTECTED: true
    }
} as const;