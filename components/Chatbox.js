import { useState } from 'react';
import axios from 'axios';

const Chatbox = ({ user }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: `omg hi ${user?.firstName ?? "there"}! ready to study?` }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async (text) => {
    const userMessage = { sender: 'user', text };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await axios.post('/api/chat', { message: text });
      const botMessage = { sender: 'bot', text: response.data.message };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleButtonClick = (message) => {
    handleSend(message);
  };

  return (
    <div className="bg-black p-4 rounded-lg shadow-md space-y-4">
      <div className="chatbox space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <span className={`text-${msg.sender === 'bot' ? 'blue-400' : 'white'}`}>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex space-x-2 h-40">
        <button
          onClick={() => handleButtonClick("Let's do it")}
          className="bg-blue-600 px-4 py-2 rounded-md h-10"
        >
          {"Let's do it"}
        </button>
        <button
          onClick={() => handleButtonClick('Great!')}
          className="bg-blue-600 px-4 py-2 rounded-md h-10"
        >
          Great!
        </button>
        <button
          onClick={() => handleButtonClick('No!')}
          className="bg-blue-600 px-4 py-2 rounded-md h-10"
        >
          No!
        </button>
      </div>
    </div>
  );
};

export default Chatbox;
