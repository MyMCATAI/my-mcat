import {auth} from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"
import { DEFAULT_BIO } from "@/constants"


export const incrementUserScore = async (amount: number) => {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const updatedUserInfo = await prismadb.userInfo.upsert({
    where: { userId },
    update: {
      score: {
        increment: amount,
      },
    },
    create: {
      userId,
      bio: DEFAULT_BIO,
      score: amount,
    },
  });

  return updatedUserInfo;
};

export const createUserInfo = async () =>{
    const {userId} = auth();
    if (!userId) {return;}

    const userInfo= await prismadb.userInfo.findUnique({
        where: {
            userId
        }
    });

    if(userInfo){
        return
    }else{
        await prismadb.userInfo.create({
            data: {userId: userId, bio:DEFAULT_BIO, score: 30 } // default 30
        })
    }
};

// update this to handle all user info
export const getBio = async ()=>{
    const {userId} = auth();
    if (!userId) {return false;}
    const userInfo =await prismadb.userInfo.findUnique({
        where: {
            userId: userId
        } 
    })

    return userInfo?.bio
}

export const getUserInfo = async () => {
    const { userId } = auth();
    if (!userId) return null;
  
    const userInfo = await prismadb.userInfo.findUnique({
      where: { userId }
    });
  
    return userInfo;
  };
  
  export const updateUserInfo = async (data: Partial<{ bio: string; [key: string]: any }>) => {
    const { userId } = auth();
    if (!userId) return null;
  
    const updatedInfo = await prismadb.userInfo.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        bio: data.bio || DEFAULT_BIO,
        ...data
      }
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

  if (!existingUser) return null;

  // Cast the preference as string since that's what Prisma expects
  const updatedInfo = await prismadb.userInfo.update({
    where: { userId },
    data: {
      notificationPreference: preference as string
    }
  });

  return updatedInfo;
};
