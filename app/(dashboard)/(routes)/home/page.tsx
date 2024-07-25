"use client"
import React from "react";
import MyCalendar from "./Calendar";
import ChatBot from "./ChatBot";
import Image from "next/image";
import rectangle from "../../../../public/homeimage.png";
import { useUser } from "@clerk/nextjs";
const Page = () => {
  const { user } = useUser();
  return (
    <>
      <div className="bg-[#001326] min-h-[80vh] text-black flex">
        <div className="container mx-auto">
          {" "}
          <div className="text-center mb-2">
                    <h1 className="text-2xl font-bold text-white mt-10">
                        Welcome {user?.firstName ?? "Guest"} to your MCAT!
                    </h1>
                </div>
          <div className="w-full max-w-full grid grid-cols-3 gap-4 p-4">
            <div className="p-4 col-span-1">
              <ChatBot />
            </div>
            <div className="p-4 col-span-2">
              <Image
                src={rectangle}
                width={0}
                height={0}
                style={{ width: "100%", height: "200px", marginBottom: "20px" }}
                alt="image"
              />
              <MyCalendar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
