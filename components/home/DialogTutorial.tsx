// components/DialogTutorial.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import TutorialContent from './TutorialContent';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface DialogTutorialProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  topic: string;
  onClose?: () => void;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-[80vw] max-w-[1200px] translate-x-[-50%] translate-y-[-50%] gap-4 border-blue-500 p-6 text-center shadow-lg rounded-lg bg-white text-black max-h-[80vh] overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent hover:scrollbar-thumb-blue-500/50",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close 
        className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTutorial: React.FC<DialogTutorialProps> = ({
  isOpen,
  onOpenChange,
  topic,
  onClose,
}) => {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const messageFormRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setShowMessageForm(false);
        setMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const toggleMessageForm = () => {
    setShowMessageForm(!showMessageForm);
    if (!showMessageForm) {
      setTimeout(() => {
        messageFormRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const renderContent = () => {
    switch (topic) {
      case 'navigation':
        return (
          <>
            <h2 className="text-4xl font-bold mb-4">Navigating the Platform</h2>
            <Image src="/navigatingone.png" alt="Software Homepage" width={800} height={600} className="w-full mb-4 rounded-lg" />
            <ol className="list-decimal list-inside text-left mt-2 text-lg space-y-6 [&>li::marker]:text-red-500">
              <li>
                <strong className="text-red-500">Stat Breakdown: </strong>Here, you can see your progress and performance. We keep a log of your total score and your time taken on your last ten tests. The cupcakes represent a currency that you can use in the marketplace to buy various goods. And we log tests reviewed over done. You can click Kalypso&apos;s icon in the top left and he provides an assessment of your progress so far as well as data on your performance so far.
              </li>
              <li>
                <strong className="text-red-500">Main Box: </strong> You can click here to access the CARs passage of the day. We automatically select one by your weakest content category and difficulty level. Just click to access it! In the bottom right, we have a link to the Doctor&apos;s Office.
              </li>
              <li>
                <strong className="text-red-500">Navbutton: </strong> Navbars are outdated! We created a nav button that&apos;s more intuitive and easy to use. Click it to access the Content Learning Suite and the Practice Tests, which are only accessible to a few beta testers at Rice &amp; Princeton right now.
              </li>
              <li>
                <strong className="text-red-500">Previous and Upcoming Tests: </strong> For past tests, you have the tests you&apos;ve done along with questions you&apos;ve reviewed. Please review questions you&apos;ve done, even if you get it right. There&apos;s also upcoming tests that you haven&apos;t done yet as well!
              </li>
              <li>
                <strong className="text-red-500">Insights: </strong> We curate a list of insights from Youtube, like videos on finding a main idea and rhetorical analysis, and also access to Reddit posts on r/MCAT. 
              </li>
              <li>
                <strong className="text-red-500">League: </strong> Every month, we rank schools by the number of cupcakes earned per user — per capita cupcake — and then list the top schools. For the month of August, these are the results from our CARs Beta Testers. We also highlight top students!
              </li>
              <li>
                <strong className="text-red-500">Bulletin: </strong> Here, you can access the tutorial to learn more about the platform, as well as the latest news from the world of MyMCAT!</li>
            </ol>
            <p className="text-lg text-gray-400 mt-2 indent-4">NOTE: Nearly every page/popup has a message function, like the one below, so you can quickly report bugs or ask for assistance.</p>
          </>
        );
      case 'cars':
        return (
          <>
            <h2 className="text-4xl font-bold mb-4">Scaffolding CARs Strategy</h2>
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-red-500 text-center">How To Read A Passage</h3>
                <video className="w-full" controls>
                  <source src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/HowToReadCARs.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <ol className="list-decimal list-inside text-left mt-2 space-y-2">
                  <li>Read the passage for the author&apos;s argument rather than the details; think the river analogy.</li>
                  <li>Map out the purpose of each paragraph and highlight key sentences.</li>
                  <li>Keep the &quot;flow&quot; of the author&apos;s argument in mind as you build your scaffold.</li>
                  <li>Use strikethrough as a tool to identify details, examples, and calls to authority.</li>
                  <li>Read your highlights like a sparknotes and select sentence in the passage as a main idea.</li>
                </ol>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-red-500 text-center">How To Answer Questions</h3>
                <video className="w-full" controls>
                  <source src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/HowToAnswerQuestionsRWTRBT.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-500">CMP (Foundations of Comprehension)</h4>
                    <ol className="list-decimal list-inside text-left mt-2 space-y-1">
                      <li>Ask yourself if it&apos;s a main idea question or a contextual question.</li>
                      <li>Restate the question in your own words and go back if needed.</li>
                      <li>Eliminate anything irrelevant or contradicted in the passage.</li>
                      <li>When between two answers, select the one that is most supported by the passage.</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-500">RWT (Reasoning Within the Text)</h4>
                    <ol className="list-decimal list-inside text-left mt-2 space-y-1">
                      <li>Ask yourself if it&apos;s a main idea question or a contextual question.</li>
                      <li>Summarize and go back to read the section in terms of the question.</li>
                      <li>Eliminate anything irrelevant or contradicted in the passage.</li>
                      <li>When between two answers, select the one that is most supported by the passage.</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-500">RBT (Reasoning Beyond the Text)</h4>
                    <ol className="list-decimal list-inside text-left mt-2 space-y-1">
                      <li>Generally relates to arguments, usually the main idea.</li>
                      <li>Summarize the new information that&apos;s brought in and compare with main idea.</li>
                      <li>Eliminate anything that does jibe with your comparison or is irrelevant.</li>
                      <li>When between two answers, select the one that is most supported by the passage.</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-red-500 text-center">How To Use Kalypso To Test</h3>
                <video className="w-full" controls>
                  <source src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/HowToUseKalypsoTest.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <ol className="list-decimal list-inside text-left mt-2 space-y-2">
                  <li>Use cmd+a to activate chatbot, or click the cat in the top right; alternatively, he activates if you spend more than 7 minutes reading a passage or more than 3 minutes on a question.</li>
                  <li>If you&apos;re struggling with a passage, then you can ask him to summarize the passage or go paragraph by paragraph or copy and paste a sentence/paragraph that you need help understanding.</li>
                  <li>If you&apos;re struggling with a question, he can help you comprehend the question, know where to look, or reason between two answer choices.</li>
                  <li>Cmd + A to trigger Kalypso. Cmd + I to get definitions of words.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-red-500 text-center">How To Use Kalypso To Review</h3>
                <video className="w-full" controls>
                  <source src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/HowToReviewQuestionsKalypso.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <ol className="list-decimal list-inside text-left mt-2 space-y-2">
                  <li>Turn tooltip/explanations off and then reason with him on the answer, asking for explanations on why the answer is right or your answer is wrong. Try to come up with an explanation yourself rather than reading first and going to the questions.</li>
                  <li>You can even turn on hint/relevant context to do so.</li>
                  <li>Then turn on tooltips and look at explanations and paste explanations to Kal if it confuses you.</li>
                </ol>
              </div>
            </div>
          </>
        );
      case 'premium':
        return (
          <>
            <h2 className="text-4xl font-bold mb-4">MD (Meow Distinction — Premium)</h2>
            <div className="flex justify-center mb-4">
              <Image src="/MDCadaceus.png" alt="MD Cadaceus" width={200} height={200} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-green-600">WHEN TO STUDY</h3>
            <p className="italic mb-2">Adaptive Scheduling Suite</p>
            <video src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/SCHEDULE.mp4" title="Schedule" className="mb-4" muted autoPlay loop playsInline />
            <ol className="list-decimal list-inside mb-4 text-center">
              <li>You enter your schedule information.</li>
              <li>Enter the resources you have (UWorld + AAMC).</li>
              <li>Take a diagnostic test.</li>
              <li>Automatically fills your time with your weakest subjects based upon the hours you give.</li>
              <li><strong>Every single day, until the day of your test is planned out</strong> with integration with UWorld and AAMC.</li>
              <li>Constant reassessment of weaknesses, syncronization with G-Cal, and automatic modification to the schedule.</li>
            </ol>

            <h3 className="text-2xl font-bold mb-2 text-green-600">WHAT TO STUDY</h3>
            <p className="italic mb-2">Adaptive Tutoring Suite</p>
            <video src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/ATS.mp4" title="ATS" className="mb-4" muted autoPlay loop playsInline />
            <ol className="list-decimal list-inside mb-4 text-center">
              <li>We calculate weaknesses from diagnostic.</li>
              <li>Collect your top six weaknesses in the top bar.</li>
              <li>Assign <strong>all content needed</strong> in videos, readings, and practice questions from Khan Academy, AK Lectures, and AAMC.</li>
              <li>Constantly adapt to <strong>show you only what you need</strong>.</li>
              <li>Have a chatbot by your side to answer all questions about content.</li>
            </ol>

            <h3 className="text-2xl font-bold mb-2 text-green-600">HOW TO STUDY</h3>
            <p className="italic mb-2">Machine Learning Insights</p>
            <Image src="/TestComponent.png" alt="Test Component" width={800} height={600} className="mb-4" />
            <ol className="list-decimal list-inside mb-4 text-center">
              <li><strong>We watch you take</strong> exams, noticing your highlights, strikethroughs, where your cursor is, etc.</li>
              <li>Then we use machine learning to <strong>analyze your strategies and compare them to that of top scorers</strong> and your best performances.</li>
              <li>We provide data-driven insights into what works and what doesn&apos;t for you, such as &apos;you perform better when you highlight less&apos;.</li>
            </ol>

            <h3 className="text-2xl font-bold mb-4 text-green-600">MORE INFO</h3>

            <p className="mb-4 text-left text-xl indent-4">
              The goal is to become a comprehensive study tool that <strong>replaces the need for a test prep company</strong>, providing way more value for way cheaper. For us to accomplish our mission, especially when facing rich test prep companies who would be threatened by us, <strong>we need the financial strength to hire data scientists, software engineers, content writers, and lawyers</strong>. Although we&apos;re committed to keep The Clinic (Flashcard Game) free and our CARs suite, we need your help in deciding how much to charge for a monthly subscription as well as what to focus on. Early Access Members get all of the above free, so long as they prove to be dedicated to the platform, provide us with feedback, and seek to score high.
            </p>
            <div id="tally-embed-container">
              <iframe
                src="https://tally.so/embed/me7q20?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                width="100%"
                height="607"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Price and Feature List"
              ></iframe>
            </div>
          </>
        );
      case 'doctorsoffice':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Welcome to The Clinic!</h2>
            <p className="mb-2 text-left indent-4">This is an optional game in MyMCAT that rewards you for your consistency in using the platform with prizes and rewards. You acquire a max of four cupcake coins per passage: for score, timing, technique, and review.</p>
            <div className="flex justify-center space-x-2">
              <Image src="/game-components/PixelCupcake.png" alt="Cupcake Coin" width={50} height={50} />
              <Image src="/game-components/PixelCupcake.png" alt="Cupcake Coin" width={50} height={50} />
              <Image src="/game-components/PixelCupcake.png" alt="Cupcake Coin" width={50} height={50} />
              <Image src="/game-components/PixelCupcake.png" alt="Cupcake Coin" width={50} height={50} />
            </div>
            <p className="mb-4 mt-2 text-left indent-4">Those can be traded for various purchases in the marketplace such as upgrading your clinic.</p>
            <div className="flex justify-center">
              <video
                src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/DoctorsOffice.mp4"
                width={800}
                height={534}
                autoPlay
                loop
                muted
                playsInline
                className="rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="mb-4 text-left indent-4">With upgrades, you increase the number of patients treated per day. This allows you to compete with other students in an MCAT season to bring glory to your school in The League, which ranks universities on who treated the most patients. More consistent usage of the website builds a streak, which allows you to get higher ratings from your patients — earning you more coins!</p>
            <div className="flex justify-center mb-4">
              <Image src="/Reviews.png" alt="Patient Reviews" width={400} height={267} className="rounded-lg" />
            </div>
            <p className="mb-4 text-left indent-4">We plan on adding more features to make The Clinic. Right now, it functions as a place to purchase items and treat patients but in the future we plan on adding functionality like being able to treat patients by answering flashcard questions such as the ones in MilesDown and Aiden.</p>
            <p className="mb-4 text-left indent-4">It will be a far more fun and rewarding experience than beating yourself to a pulp with flashcards.</p>
          </>
        );
      case 'beta':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Rules for Early Access Individuals</h2>
            <p className="text-left indent-4">We spoke to your HPAs at Princeton and Rice for permission to include you in our early access program. You are here because your interaction with the website will improve it for public release. Due to the sensitive nature of our content, and the fact that test prep companies will be threatened by us, we need you to agree to the following rules:</p>
            <ul className="list-disc list-inside mt-2">
              <li>You cannot share the internal details of our service to the public.</li>
              <li>No screenshots, screen-recordings, or manipulations of any kind. </li>
              <li>Email prynce@mymcat.ai atleast <strong>once a week</strong> with concerns, praise, feature requests, bugs, etc.</li>
              <li>You can sign up a <strong>maximum of three individuals</strong> but they have to have an @rice.edu or @princeton.edu and know the current password.</li>
              <li>Prolonged inactivity will <strong>result in removal of access</strong> with no reinstatement.</li>
            </ul>
            <p className="mb-4 text-left indent-4">Successful completion of our early access program will entitle you to free access to MD premium when we launch even beyond early access. The current password is:</p>
            <p className="mb-4 text-center text-red-500 indent-4"><strong>Cupcake528</strong></p>
          </>
        );
      default:
        return <p>Select a topic to view more information.</p>;
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        {renderContent()}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={toggleMessageForm}
            className="p-3 bg-gray-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
            aria-label="Send Message"
          >
            <Mail className="h-6 w-6" />
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-3 bg-gray-500 text-white rounded text-lg font-semibold hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors duration-200"
          >
            Close
          </button>
        </div>
        {showMessageForm && (
          <div ref={messageFormRef} className="mt-4 space-y-2 border border-gray-300 p-4 rounded-lg bg-gray-100">
            <textarea
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 rounded resize-none text-gray-800 border border-gray-300"
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowMessageForm(false);
                  setMessage('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </DialogPrimitive.Root>
  );
};

export default DialogTutorial;