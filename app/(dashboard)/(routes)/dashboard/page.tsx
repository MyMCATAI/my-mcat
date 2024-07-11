"use client";

import React from 'react';
import Tasks from "@/components/ui/tasks";
import Calendar from "@/components/ui/calendar";
import { useUser } from "@clerk/nextjs";
import Chatbox from '@/components/Chatbox';

const HomePage: React.FC = () => {
    const { user } = useUser();

    return (
        <div className="bg-[#001326] min-h-screen p-8 text-white flex justify-center">
            <div className="max-w-screen-xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">
                        Welcome {user?.firstName ?? "Guest"} to your MCAT!
                    </h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="col-span-1 lg:col-span-2">
                        <Chatbox user={user} />
                    </div>
                    <div className="col-span-1">
                        <Tasks />
                    </div>
                </div>
                <div className="mt-8">
                    <Calendar />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
