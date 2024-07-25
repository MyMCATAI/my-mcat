"use client";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { TinderLikeCard } from "react-stack-cards";
import image from "../../../../public/hero.gif";
import cat from "../../../../public/cat.png";
import {
  FloatingMenu,
  MainButton,
  ChildButton,
} from "react-floating-button-menu";

interface Question {
  question: string;
  image: any;
}

type ChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
type Directions = "up" | "down" | "left" | "right";

const Adaptive: React.FC = () => {
  const [directionTinder, setDirectionTinder] = useState<string>(
    "swipeCornerTopRight"
  );
  const [textareas, setTextareas] = useState<string[]>(["", "", "", ""]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const Tinder = useRef<any>(null);

  const onTinderRightSwipe = () => {
    setDirectionTinder("swipeCornerTopRight");
    if (Tinder?.current) {
      Tinder?.current.swipe();
    }
  };

  const onTinderLeftSwipe = () => {
    setDirectionTinder("swipeCornerTopLeft");
    if (Tinder?.current) {
      Tinder?.current.swipe();
    }
  };

  const arr = ["first", "second", "third", "fourth"];

  const handleTextareaChange = (index: number, event: ChangeEvent) => {
    const newTextareas = [...textareas];
    newTextareas[index] = event.target.value;
    setTextareas(newTextareas);
  };

  const questions: Question[] = [
    { question: "Question 1", image: image },
    { question: "Question 2", image: image },
    { question: "Question 3", image: image },
    { question: "Question 4", image: image },
    { question: "Question 5", image: image },
    { question: "Question 6", image: image },
  ];

  return (
    <div className="container">
      <div className="w-[70%] m-auto">
        <div
          className="flex flex-col items-center justify-center p-6 mt-10 rounded-[10px]"
          style={{ boxShadow: "rgba(2, 19, 38, 0.1) 0px 8px 24px" }}
        >
          <div className="ml-auto">
            <button>
              <svg
                width="30"
                height="30"
                className="ml-auto"
                fill="none"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.296 9.015a3 3 0 1 0-.59 5.97 3 3 0 0 0 .59-5.97v0ZM19.518 12a7.238 7.238 0 0 1-.072.975l2.12 1.662a.507.507 0 0 1 .114.644l-2.005 3.469a.507.507 0 0 1-.615.215l-2.105-.847a.753.753 0 0 0-.711.082 7.703 7.703 0 0 1-1.01.588.747.747 0 0 0-.413.569l-.316 2.244a.519.519 0 0 1-.5.43h-4.01a.52.52 0 0 1-.501-.415l-.315-2.242a.753.753 0 0 0-.422-.573 7.278 7.278 0 0 1-1.006-.59.75.75 0 0 0-.708-.08l-2.105.848a.507.507 0 0 1-.616-.215L2.32 15.295a.506.506 0 0 1 .114-.644l1.792-1.406a.752.752 0 0 0 .28-.66 6.392 6.392 0 0 1 0-1.165.75.75 0 0 0-.284-.654L2.431 9.36a.507.507 0 0 1-.111-.641L4.325 5.25a.507.507 0 0 1 .616-.215l2.105.847a.755.755 0 0 0 .71-.082 7.71 7.71 0 0 1 1.01-.587.747.747 0 0 0 .414-.57L9.495 2.4a.52.52 0 0 1 .5-.43h4.01a.52.52 0 0 1 .502.416l.315 2.241a.753.753 0 0 0 .421.573c.351.17.687.366 1.006.59a.75.75 0 0 0 .709.08l2.104-.848a.507.507 0 0 1 .616.215l2.005 3.469a.506.506 0 0 1-.115.644l-1.791 1.406a.752.752 0 0 0-.284.66c.016.195.026.39.026.585Z"></path>
              </svg>
            </button>
          </div>
          <TinderLikeCard
            images={arr}
            width="750"
            height="400"
            direction={directionTinder}
            duration={400}
            ref={Tinder}
            className="tinder"
          >
            {questions?.map((question, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center justify-center shadow w-full h-full bg-white border border-gray-400 p-4 rounded-[10px]"
              >
                <div className="relative z-10 w-full h-full flex flex-col ">
                  <div className="flex justify-between">
                    <div>
                      <h1 className="text-3xl mt-3">{question.question}</h1>
                    </div>
                    <div style={{ width: "350px", marginLeft: "auto" }}>
                      <Image
                        src={question.image}
                        alt="Image"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  </div>
                  <p className="font-semibold">Answer</p>
                  <textarea
                    className="w-full mt-2 border border-gray-400 p-2 z-10 rounded-[10px]"
                    rows={4}
                    value={textareas[i]}
                    onChange={(e) => handleTextareaChange(i, e)}
                  />
                </div>
              </div>
            ))}
          </TinderLikeCard>
          <div className="mt-20 flex gap-10">
            <button
              onClick={onTinderLeftSwipe}
              className="mt-5 py-4 bg-[#ece6f0] text-[#65558F] rounded-[20px] w-[180px]"
            >
              Missed it!
            </button>
            <button
              onClick={onTinderRightSwipe}
              className="mt-5 py-4 bg-[#ece6f0] text-[#65558F] rounded-[20px] w-[180px]"
            >
              Got it!
            </button>
          </div>

          <div className="flex w-[100%] justify-between mt-5">
            <FloatingMenu
              slideSpeed={500}
              spacing={8}
              isOpen={isOpen}
            >
              <MainButton
                iconResting={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    viewBox="0 0 91 89"
                    fill="none"
                  >
                    <path
                      d="M81 44.5C81 63.3455 65.3168 79 45.5 79C25.6832 79 10 63.3455 10 44.5C10 25.6545 25.6832 10 45.5 10C65.3168 10 81 25.6545 81 44.5Z"
                      stroke="#007AFF"
                      strokeWidth="20"
                    />
                  </svg>
                }
                iconActive={""}
                background="white"
                onClick={() => setIsOpen(!isOpen)}
                size={50}
              />
              <ChildButton
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 70 70" fill="none">
                    <g clip-path="url(#clip0_488_1762)">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M11.6667 61.25H46.6667C48.2776 61.25 49.5834 59.9442 49.5834 58.3333V11.6667C49.5834 10.0558 48.2776 8.75 46.6667 8.75H11.6667C10.0559 8.75 8.75004 10.0558 8.75004 11.6667V58.3333C8.75004 59.9442 10.0559 61.25 11.6667 61.25ZM46.6667 64.1667H11.6667C8.44504 64.1667 5.83337 61.5549 5.83337 58.3333V11.6667C5.83337 8.44501 8.44504 5.83334 11.6667 5.83334H46.6667C49.8883 5.83334 52.5 8.44501 52.5 11.6667V58.3333C52.5 61.5549 49.8883 64.1667 46.6667 64.1667Z" fill="#007AFF"/>
                      <rect x="10" y="64" width="127" height="100" fill="white"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M26.25 18.9583C26.25 18.1529 26.9029 17.5 27.7083 17.5H45.2083C46.0138 17.5 46.6667 18.1529 46.6667 18.9583C46.6667 19.7638 46.0138 20.4167 45.2083 20.4167H27.7083C26.9029 20.4167 26.25 19.7638 26.25 18.9583Z" fill="#007AFF"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M26.25 24.7917C26.25 23.9862 26.9029 23.3333 27.7083 23.3333H45.2083C46.0138 23.3333 46.6667 23.9862 46.6667 24.7917C46.6667 25.5971 46.0138 26.25 45.2083 26.25H27.7083C26.9029 26.25 26.25 25.5971 26.25 24.7917Z" fill="#007AFF"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M26.25 36.4583C26.25 35.6529 26.9029 35 27.7083 35H45.2083C46.0138 35 46.6667 35.6529 46.6667 36.4583C46.6667 37.2638 46.0138 37.9167 45.2083 37.9167H27.7083C26.9029 37.9167 26.25 37.2638 26.25 36.4583Z" fill="#007AFF"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M26.25 42.2917C26.25 41.4862 26.9029 40.8333 27.7083 40.8333H45.2083C46.0138 40.8333 46.6667 41.4862 46.6667 42.2917C46.6667 43.0971 46.0138 43.75 45.2083 43.75H27.7083C26.9029 43.75 26.25 43.0971 26.25 42.2917Z" fill="#007AFF"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5833 37.9167V42.2917H18.9583V37.9167H14.5833ZM13.125 35H20.4166C21.2221 35 21.875 35.6529 21.875 36.4583V43.75C21.875 44.5554 21.2221 45.2083 20.4166 45.2083H13.125C12.3196 45.2083 11.6666 44.5554 11.6666 43.75V36.4583C11.6666 35.6529 12.3196 35 13.125 35Z" fill="#007AFF"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M22.9061 17.9271C23.4756 18.4966 23.4756 19.42 22.9061 19.9895L16.0416 26.854L12.0938 22.9062C11.5242 22.3367 11.5242 21.4133 12.0938 20.8438C12.6633 20.2743 13.5866 20.2743 14.1562 20.8438L16.0416 22.7293L20.8438 17.9271C21.4133 17.3577 22.3367 17.3577 22.9061 17.9271Z" fill="#007AFF"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M61.25 35H58.3333V57.3611L59.7916 59.3056L61.25 57.3611V35ZM64.1666 58.3333L59.7916 64.1667L55.4166 58.3333V32.0833H64.1666V58.3333Z" fill="#007AFF"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M61.25 24.7917H58.3333V27.7083H61.25V24.7917ZM58.3333 21.875H61.25C62.8608 21.875 64.1666 23.1808 64.1666 24.7917V30.625H55.4166V24.7917C55.4166 23.1808 56.7224 21.875 58.3333 21.875Z" fill="#007AFF"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_488_1762">
                        <rect width="70" height="70" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                }
                background="white"
                size={40}
              />
              <ChildButton
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 80 100" fill="none">
                    <path d="M71.4448 23H45.9892C43.655 23 41.5462 24.1814 40 26.077C38.4549 24.1814 36.3428 23 34.0119 23H8.55518C3.83747 23 0 27.7996 0 33.694V65.5149C0 71.412 3.84076 76.2061 8.55518 76.2061H34.0119C36.3461 76.2061 38.4549 75.0275 40 73.1291C41.5451 75.0275 43.6583 76.2061 45.9892 76.2061H71.4448C76.1625 76.2061 80 71.4052 80 65.5149V33.694C80 27.8023 76.1625 23 71.4448 23ZM77.4329 65.5163C77.4329 69.6524 74.7515 72.9986 71.4448 72.9986H46.8057V70.1909H45.6024V72.9519C42.4814 72.6978 40 69.4807 40 65.5163C40 69.4807 37.5208 72.7033 34.3933 72.9519V70.1909H33.1899V72.9986H8.55518C5.2463 72.9986 2.5671 69.6469 2.5671 65.5163V33.6967C2.5671 29.5606 5.2485 26.2103 8.55518 26.2103H33.1899V29.018H34.3933V26.2597C37.5175 26.5083 40 29.7241 40 33.6967C40 29.7282 42.4792 26.5083 45.6078 26.2597V29.018H46.8112V26.2103H71.447C74.757 26.2103 77.4362 29.5634 77.4362 33.6967V65.5163H77.4329ZM33.191 62.7085H34.3944V66.4504H33.191V62.7085ZM33.191 55.2193H34.3944V58.968H33.191V55.2193ZM33.191 32.764H34.3944V36.5045H33.191V32.764ZM33.191 47.7342H34.3944V51.4802H33.191V47.7342ZM33.191 40.2491H34.3944V43.991H33.191V40.2491ZM45.6078 32.764H46.8112V36.5045H45.6078V32.764ZM45.6078 62.7085H46.8112V66.4504H45.6078V62.7085ZM45.6078 40.2491H46.8112V43.991H45.6078V40.2491ZM45.6078 47.7342H46.8112V51.4802H45.6078V47.7342ZM45.6078 55.2193H46.8112V58.968H45.6078V55.2193ZM17.5389 34.6981H28.0195V36.624H17.5389V34.6981ZM17.5389 42.0307H28.0195V43.9552H17.5389V42.0307ZM7.05844 49.4224H28.0227V51.3469H7.05844V49.4224ZM7.05844 56.7523H28.0227V58.6823H7.05844V56.7523ZM7.05844 64.1563H28.0227V66.0795H7.05844V64.1563ZM8.85409 44.5171L9.40136 42.4016H12.5564L13.1179 44.5171H14.0366H14.9598L12.0179 34.1198H11.0091H9.99808L7.05624 44.5171H7.95736H8.85409ZM10.9838 36.4372L12.0882 40.6117H9.88049L10.9838 36.4372ZM51.4454 34.6981H72.5141V36.624H51.4454V34.6981ZM51.4454 42.0307H72.5141V43.9552H51.4454V42.0307ZM51.5509 49.4224H72.5141V51.3469H51.5509V49.4224ZM51.5509 56.7523H72.5141V58.6823H51.5509V56.7523ZM51.5509 64.1563H72.5141V66.0795H51.5509V64.1563Z" fill="#007AFF"/>
                  </svg>
                }
                background="white"
                size={40}
              />
              <ChildButton
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 76 81" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M39.1353 14.2955C39.1353 13.4023 38.4535 12.6757 37.6154 12.6757H16.7795C15.9414 12.6757 15.2595 13.4025 15.2595 14.2955V45.7506C15.2595 46.6438 15.9414 47.3706 16.7795 47.3706H30.5223V28.1515C30.5223 26.5506 31.7399 25.253 33.242 25.253H39.1354L39.1353 14.2955Z" fill="#B3261E"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.2352 45.7506V14.2955C14.2352 12.8004 15.3765 11.5839 16.7795 11.5839H37.6156C39.0184 11.5839 40.1598 12.8004 40.1598 14.2955V25.253H42.5988V10.1169C42.5988 8.92075 41.689 7.95113 40.5666 7.95113H13.5016C12.3793 7.95113 11.4695 8.92075 11.4695 10.1169V50.5242C11.4695 51.7204 12.3793 52.69 13.5016 52.69H30.5223V48.4624H16.7795C15.3765 48.4624 14.2352 47.2459 14.2352 45.7506Z" fill="#B3261E"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M62.4984 28.3098H35.4335C34.3111 28.3098 33.4014 29.2794 33.4014 30.4756V70.8829C33.4014 72.0791 34.3111 73.0486 35.4335 73.0486H62.4984C63.6209 73.0486 64.5305 72.0789 64.5305 70.8829V30.4758C64.5305 29.2796 63.6209 28.3098 62.4984 28.3098ZM63.0461 70.8831C63.0461 71.205 62.8003 71.4667 62.4984 71.4667H35.4335C35.1314 71.4667 34.8857 71.205 34.8857 70.8831V30.4758C34.8857 30.1538 35.1316 29.892 35.4335 29.892H62.4984C62.8003 29.892 63.0461 30.1538 63.0461 30.4758V70.8831Z" fill="#B3261E"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M49.2058 40.9461C47.0936 44.413 44.4437 47.6305 41.4244 50.6756C44.6959 53.6351 47.2923 56.8748 49.2058 60.4005C51.1544 56.6212 53.6872 53.3271 56.9872 50.6756C53.7384 47.4296 51.1051 44.1857 49.2058 40.9461Z" fill="#B3261E"/>
                  </svg>
                }
                background="white"
                size={40}
              />
            </FloatingMenu>
            <div className="ml-auto ">
              <button>
                <Image src={cat} alt={"Image"} width={100} height={100} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adaptive;
