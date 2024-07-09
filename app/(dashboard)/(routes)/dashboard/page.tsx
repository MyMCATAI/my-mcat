"use client";

import Tasks from "@/components/ui/tasks";
import Calendar from "@/components/ui/calendar";
import { useUser } from "@clerk/nextjs";

const HomePage = () => {
    const {user} = useUser();

    return (
        <div className="bg-[#001326] min-h-screen p-8 text-white flex justify-center">
        <div className="max-w-screen-xl w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Welcome {user?.firstName} to your MCAT!</h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-1 lg:col-span-2">
                    <div className="bg-black p-4 rounded-lg shadow-md space-y-4">
                        <div className="flex items-center space-x-4">
                            <span className="text-blue-400">😺 kalypso</span>
                            <p className="bg-gray-800 p-2 rounded-md">omg hi {user?.firstName}! ready to study?</p>
                        </div>
                        <div className="flex space-x-2 h-40">
                            <button className="bg-blue-600 px-4 py-2 rounded-md h-10">Let's do it</button>
                            <button className="bg-blue-600 px-4 py-2 rounded-md h-10">Great!</button>
                            <button className="bg-blue-600 px-4 py-2 rounded-md h-10">No!</button>
                        </div>
                    </div>
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
    )
}

export default HomePage;
