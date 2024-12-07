'use client'

import { useState } from 'react';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface MessageButtonProps {
  iconOnly?: boolean;
  withShadow?: boolean;
}

const MessageButton: React.FC<MessageButtonProps> = ({ iconOnly = false, withShadow = false }) => {
  const [showForm, setShowForm] = useState(false);

  const handleSendMessage = async (message: string) => {
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
        setShowForm(false);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className={`flex items-center justify-center ${
          iconOnly 
            ? "w-10 h-10 border border-[--theme-border-color]" 
            : "gap-2 px-4 py-2 bg-gray-600"
        } rounded-md hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200 ${
          withShadow ? "shadow-md hover:shadow-lg" : ""
        }`}
      >
        <Mail className={iconOnly ? "h-5 w-5" : "h-4 w-4"} />
        {!iconOnly && "Send Message"}
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Send us a message</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const message = formData.get('message') as string;
              handleSendMessage(message);
            }} className="space-y-4">
              <textarea
                name="message"
                placeholder="Your message"
                className="w-full p-2 rounded resize-none text-gray-800 bg-white dark:bg-gray-700 dark:text-gray-200"
                required
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageButton; 