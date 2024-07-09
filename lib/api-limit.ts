import {auth} from "@clerk/nextjs"

import prismadb from "@/lib/prismadb"
import { MAX_FREE_COUNTS } from "@/constants"
import { useDebugValue } from "react";

export const increaseApiLimit = async () =>{
    const {userId} = auth();
    if (!userId) {return;}

    const userApiLimit= await prismadb.userAPILimit.findUnique({
        where: {
            userId
        }
    });

    if(userApiLimit){
        await prismadb.userAPILimit.update({
            where: {userId: userId},
            data: {count: userApiLimit.count+1}
        })
    }else{
        await prismadb.userAPILimit.create({
            data: {userId: userId, count: 1}
        })
    }
};

export const checkApiLimit = async ()=>{
    const {userId} = auth();
    if (!userId) {return false;}
    const userAPILimit =await prismadb.userAPILimit.findUnique({
        where: {
            userId: userId
        } 
    })
    if (!userAPILimit || userAPILimit.count < MAX_FREE_COUNTS){
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
    const userAPILimit = await prismadb.userAPILimit.findUnique({
        where: {
            userId
        }
    })
    if(!userAPILimit){
        return 0
    }
    return userAPILimit.count;
}