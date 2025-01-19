import {auth} from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"
import { DEFAULT_BIO } from "@/constants"


export const incrementUserScore = async (amount: number) => {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const userInfo = await prismadb.userInfo.findUnique({
    where: { userId }
  });

  if (!userInfo) {
    throw new Error('User info not found. Please complete onboarding first.');
  }

  const updatedUserInfo = await prismadb.userInfo.update({
    where: { userId },
    data: {
      score: {
        increment: amount,
      },
    },
  });

  return updatedUserInfo;
};

export const getUserInfo = async () => {
  const { userId } = auth();
  if (!userId) return null;

  const userInfo = await prismadb.userInfo.findUnique({
    where: { userId }
  });

<<<<<<< HEAD
  if (!userInfo) {
    throw new Error('User info not found. Please complete onboarding first.');
  }

  return userInfo;
=======
    if(userInfo){
        return
    }else{
        await prismadb.userInfo.create({
            data: {userId: userId, bio:DEFAULT_BIO, score: 20 } // default 20
        })
    }
>>>>>>> 9badc84 (changed some copy and dropped 30 to 20 for initial coins)
};

export const updateUserInfo = async (data: Partial<{ bio: string; [key: string]: any }>) => {
  const { userId } = auth();
  if (!userId) return null;

  const existingUser = await prismadb.userInfo.findUnique({
    where: { userId }
  });

  if (!existingUser) {
    throw new Error('User info not found. Please complete onboarding first.');
  }

  const updatedInfo = await prismadb.userInfo.update({
    where: { userId },
    data
  });

  return updatedInfo;
};

export const setBio = async (newBio: string) => {
  return updateUserInfo({ bio: newBio });
};

export type NotificationPreference = 'all' | 'important' | 'none';

export const updateNotificationPreference = async (preference: NotificationPreference) => {
  const { userId } = auth();
  if (!userId) return null;

  const existingUser = await prismadb.userInfo.findUnique({
    where: { userId }
  });

  if (!existingUser) {
    throw new Error('User info not found. Please complete onboarding first.');
  }

  const updatedInfo = await prismadb.userInfo.update({
    where: { userId },
    data: {
      notificationPreference: preference as string
    }
  });

  return updatedInfo;
};
