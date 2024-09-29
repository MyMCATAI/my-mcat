'use client'
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Cat, X, Facebook, Twitter, Link2, Linkedin } from 'lucide-react';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton } from 'react-share';

interface MDOnlyFeaturesDialogProps {
  content: React.ReactNode;
}

const MDOnlyFeaturesDialog: React.FC<MDOnlyFeaturesDialogProps> = ({ content }) => {
  const [showSharePopup, setShowSharePopup] = useState(false);

  return (
    <div className="relative">
      {content}
      <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10">
        <div className="text-[--theme-text-color] text-center p-8 bg-[--theme-leaguecard-color] border border-[--theme-border-color] rounded-lg relative">
          <h3 className="text-2xl mb-4">MD Premium Features</h3>
          <p>This feature is available for SELECT @rice.edu or @princeton.edu students only.</p>
          <p>For other students, please click the button below to apply for access.</p>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setShowSharePopup(true)}
              className="border border-[--theme-border-color] bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
              aria-label="Share"
            >
              <Cat className="h-4 w-4" />
            </Button>
          </div>
          {showSharePopup && (
            <SharePopup onClose={() => setShowSharePopup(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

interface SharePopupProps {
  onClose: () => void;
}

const SharePopup: React.FC<SharePopupProps> = ({ onClose }) => {
  const shareUrl = 'https://mymcat.ai';
  const shareTitle = 'MyMCAT.ai is a freemium MCAT platform seeking to create the best learning experience for premeds. Right now, they have a free CARs suite & an in-developmentMCAT game! Not gonna lie, they offered me incentives to share this, but it\'s still really cool!';
  const hashtag = '#MyMCAT';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="absolute inset-0 bg-black text-black bg-opacity-50 flex items-center justify-center">
      <div className="text-[--theme-text-color] text-center p-8 bg-[--theme-leaguecard-color] rounded-lg relative w-11/12 max-w-m border-2 border-[--theme-border-color]">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close Share Popup"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl mb-4"><strong>MD Premium will release at a later date.</strong></h2>
        <p className="mb-4 text-xs">
          Every month, we purchase six months access to UWorld for anyone who drops a link to www.mymcat.ai in their class GroupMe and/or writes three reddit comments about us on r/MCAT. 
        </p>
        <p className="mb-4 text-xs">
          Alternatively, you can share it to two of the following socials below:
        </p>
        <div className="flex flex-col space-y-3">
          <FacebookShareButton url={shareUrl} hashtag={hashtag}>
            <Button className="w-full flex items-center space-x-2 border border-[--theme-border-color] bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]" aria-label="Share on Facebook">
              <Facebook className="h-5 w-5" />
              <span>Share on Facebook</span>
            </Button>
          </FacebookShareButton>
          
          <LinkedinShareButton url={shareUrl} title={shareTitle}>
            <Button className="w-full flex items-center space-x-2 border border-[--theme-border-color] bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]" aria-label="Share on LinkedIn">
              <Linkedin className="h-5 w-5" />
              <span>Share on LinkedIn</span>
            </Button>
          </LinkedinShareButton>
          
          <TwitterShareButton url={shareUrl} title={shareTitle}>
            <Button className="w-full flex items-center space-x-2 border border-[--theme-border-color] bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]" aria-label="Share on Twitter">
              <Twitter className="h-5 w-5" />
              <span>Share on Twitter</span>
            </Button>
          </TwitterShareButton>
          
          <Button 
            onClick={handleCopyLink} 
            className="w-full flex items-center space-x-2 border border-[--theme-border-color] bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]" 
            aria-label="Copy Link"
          >
            <Link2 className="h-5 w-5" />
            <span>Copy Link</span>
          </Button>
        </div>
        <p className="mt-4 text-xs text-center">
          Message proof to kalypso@mymcat.ai for a raffle ticket.
        </p>
      </div>
    </div>
  );
};

export default MDOnlyFeaturesDialog;