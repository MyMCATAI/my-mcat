'use client'

import { useState } from 'react';
import { Mail } from 'lucide-react';
import MessageForm from '@/components/MessageForm';

interface MessageButtonProps {
  className?: string;
}

const MessageButton: React.FC<MessageButtonProps> = ({ 
  className
}) => {
  const [showMessageForm, setShowMessageForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowMessageForm(true)}
        className={`absolute top-4 right-16 p-2 rounded-full shadow-lg bg-gray-300 text-gray-600 hover:bg-blue-500 hover:text-white transition-colors duration-200 ${className || ''}`}
        aria-label="Send Message"
      >
        <Mail className="w-6 h-6" />
        <span className="sr-only">Send Message</span>
      </button>

      <MessageForm 
        isOpen={showMessageForm}
        onClose={() => setShowMessageForm(false)}
      />
    </>
  );
};

export default MessageButton; 