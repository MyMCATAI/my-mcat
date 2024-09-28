// components/DialogTutorial.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import TutorialContent from './TutorialContent';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { useState, useRef } from 'react';
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
                  <li>If you're struggling with a passage, then you can ask him to summarize the passage or go paragraph by paragraph or copy and paste a sentence/paragraph that you need help understanding.</li>
                  <li>If you're struggling with a question, he can help you comprehend the question, know where to look, or reason between two answer choices.</li>
                  <li>Cmd + A to trigger Kalypso. Cmd + I to get definitions of words.</li>
                </ol>
              </div>

              {['How To Use Kalypso To Review'].map((title) => (
                <div key={title} className="space-y-2 text-red-500">
                  <h3 className="text-xl font-semibold text-center">{title}</h3>
                  <video className="w-full" controls>
                    <source src={`/videos/${title.toLowerCase().replace(/ /g, '_')}.mp4`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ))}
            </div>
          </>
        );
      case 'premium':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Premium Meow Distinction</h2>
            <p>Discover the benefits of our Premium Meow features:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Access to exclusive study materials and practice tests</li>
              <li>One-on-one tutoring sessions with expert instructors</li>
              <li>Advanced analytics to track your progress</li>
              <li>Priority support for all your MCAT-related questions</li>
            </ul>
          </>
        );
      case 'beta':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Beta Tester Information</h2>
            <p>Important information for beta testers:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Report any bugs or issues you encounter</li>
              <li>Provide feedback on new features and improvements</li>
              <li>Gain early access to upcoming platform updates</li>
              <li>Participate in exclusive beta tester surveys and discussions</li>
            </ul>
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
            className="p-2 bg-gray-500 text-white rounded-full hover:bg-blue-600"
            aria-label="Send Message"
          >
            <Mail className="h-5 w-5" />
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
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
