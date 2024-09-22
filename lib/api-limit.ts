import {auth} from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"
import { MAX_FREE_COUNTS,DEFAULT_BIO } from "@/constants"
import { useDebugValue } from "react";

export const increaseApiLimit = async () =>{
    const {userId} = auth();
    if (!userId) {return;}

    const userInfo= await prismadb.userInfo.findUnique({
        where: {
            userId
        }
    });

    if(userInfo){
        await prismadb.userInfo.update({
            where: {userId: userId},
            data: {apiCount: userInfo.apiCount+1}
        })
    }else{
        await prismadb.userInfo.create({
            data: {userId: userId, apiCount: 1, bio:DEFAULT_BIO}
        })
    }
};

export const checkApiLimit = async ()=>{
    const {userId} = auth();
    if (!userId) {return false;}
    const userInfo =await prismadb.userInfo.findUnique({
        where: {
            userId: userId
        } 
    })
    if (!userInfo || userInfo.apiCount < MAX_FREE_COUNTS){
        return true
    }else{
        return false
    }
}

export const getApiLimitCount=async () => {
    const {userId} = auth();
    if(!userId){
        return 0
    }
    const userInfo = await prismadb.userInfo.findUnique({
        where: {
            userId
        }
    })
    if(!userInfo){
        return 0
    }
    return userInfo.apiCount;
}