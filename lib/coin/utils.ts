import {
    ATS_ANKI_COIN_REWARDS,
    ATS_ANKI_THRESHOLDS,
    SYSTEM_CONSTANTS,
    ABSENCE_PENALTIES,
} from './constants';
import prisma from '@/lib/prismadb';

export function calculateAnkiReward(score: number): number {
    if (score >= ATS_ANKI_THRESHOLDS.GREAT) return ATS_ANKI_COIN_REWARDS.GREAT;
    if (score >= ATS_ANKI_THRESHOLDS.GOOD) return ATS_ANKI_COIN_REWARDS.GOOD;
    if (score >= ATS_ANKI_THRESHOLDS.OKAY) return ATS_ANKI_COIN_REWARDS.OKAY;
    if (score <= ATS_ANKI_THRESHOLDS.REALLY_BAD) return ATS_ANKI_COIN_REWARDS.REALLY_BAD;
    return 0;
}

export function calculateCarsReward(totalStars: number, difficulty?: number): number {
    let coinsEarned = 0;
    if (totalStars === 9) {
        if (difficulty && difficulty >= 3) {
            coinsEarned = 4;  // 4 coins for perfect score on difficult passage
        } else {
            coinsEarned = 3;  // 3 coins for perfect score on easier passage
        }
    } else if (totalStars >= 6) {
        coinsEarned = 2;  // 2 coins for 6-8 stars
    } else if (totalStars >= 4) {
        coinsEarned = 1;  // 1 coin for 4-5 stars
    }
    return coinsEarned;
}

export function enforceMinimumCoins(currentCoins: number): number {
    return Math.max(currentCoins, SYSTEM_CONSTANTS.COIN_FLOOR);
}

// Check if user has tasks scheduled for a given date range
export async function hasScheduledTasks(userId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const tasks = await prisma.calendarActivity.findFirst({
        where: {
            userId,
            scheduledDate: {
                gte: startDate,
                lte: endDate
            }
        }
    });

    return !!tasks;
}

// Calculate daily absence penalty
export async function calculateDailyAbsencePenalty(
    userId: string,
    date: Date = new Date()
): Promise<number> {
    if (!SYSTEM_CONSTANTS.DAILY_CHECK_REQUIRED) return 0;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if user has tasks scheduled
    if (ABSENCE_PENALTIES.DAILY.REQUIRES_TASKS) {
        const hasTasks = await hasScheduledTasks(userId, startOfDay, endOfDay);
        if (!hasTasks) return 0;
    }

    // Check user activity
    const activity = await prisma.userActivity.findFirst({
        where: {
            userId,
            startTime: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    });

    return activity ? 0 : ABSENCE_PENALTIES.DAILY.AMOUNT;
}

// Calculate weekly absence penalty
export async function calculateWeeklyAbsencePenalty(
    userId: string,
    date: Date = new Date()
): Promise<number> {
    if (!SYSTEM_CONSTANTS.WEEKLY_CHECK_REQUIRED) return 0;

    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(date);
    endOfWeek.setHours(23, 59, 59, 999);

    // Check if user has tasks scheduled
    if (ABSENCE_PENALTIES.WEEKLY.REQUIRES_TASKS) {
        const hasTasks = await hasScheduledTasks(userId, startOfWeek, endOfWeek);
        if (!hasTasks) return 0;
    }

    // Check user activity
    const activity = await prisma.userActivity.findFirst({
        where: {
            userId,
            startTime: {
                gte: startOfWeek,
                lte: endOfWeek
            }
        }
    });

    return activity ? 0 : ABSENCE_PENALTIES.WEEKLY.AMOUNT;
}

// Apply absence penalties with floor protection
export async function applyAbsencePenalties(userId: string): Promise<number> {
    const [dailyPenalty, weeklyPenalty] = await Promise.all([
        calculateDailyAbsencePenalty(userId),
        calculateWeeklyAbsencePenalty(userId)
    ]);

    const totalPenalty = dailyPenalty + weeklyPenalty;
    if (totalPenalty === 0) return 0;

    // Get current user coins
    const userInfo = await prisma.userInfo.findUnique({
        where: { userId },
        select: { score: true }
    });

    if (!userInfo) return 0;

    const currentCoins = userInfo.score || 0;
    const newCoins = enforceMinimumCoins(currentCoins + totalPenalty);

    // Only update if there's an actual change
    if (newCoins !== currentCoins) {
        await prisma.userInfo.update({
            where: { userId },
            data: { score: newCoins }
        });
    }

    return totalPenalty;
} 