"use client";
import React, { useState, useEffect } from 'react';
import { Users, FileText, Settings, BarChart2, Edit, Trash2 } from 'lucide-react';

// Updated Question interface to match our new schema
interface Question {
  id: string;
  questionID: string;
  questionContent: string;
  questionOptions: string[];
  questionAnswerNotes?: string;
  contentCategory: string;
  passageId?: string;
  categoryId: string;
  category?: {
    subjectCategory: string;
    contentCategory: string;
    conceptCategory: string;
  };
}

const AdminPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    questionID: '',
    questionContent: '',
    questionOptions: ['', '', '', ''],
    questionAnswerNotes: '',
    contentCategory: '',
    passageId: '',
    categoryId: '',
  });
  

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    console.log("fetchQuestions")
    try {
      const response = await fetch('/api/question');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions);
      console.log("data",data)
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      questionOptions: prev.questionOptions?.map((opt, i) => i === index ? value : opt) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuestion,
          questionOptions: newQuestion.questionOptions?.join('|'),
        }),
      });
      if (!response.ok) throw new Error('Failed to add question');
      fetchQuestions(); // Refresh the question list
      setNewQuestion({ // Reset the form
        questionID: '',
        questionContent: '',
        questionOptions: ['', '', '', ''],
        questionAnswerNotes: '',
        contentCategory: '',
        passageId: '',
        categoryId: '',
      });
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  return (
    <div className="bg-[#001326] min-h-screen p-8 text-white">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Questions" value={questions.length.toString()} icon={<FileText />} />
          <StatCard title="Total Users" value="1,234" icon={<Users />} />
          <StatCard title="Active Sessions" value="789" icon={<BarChart2 />} />
          <StatCard title="System Health" value="98%" icon={<Settings />} />
        </div>
        
        <div className="bg-[#0A2744] p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Question</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="questionID"
              value={newQuestion.questionID}
              onChange={handleInputChange}
              placeholder="Question ID"
              className="w-full p-2 bg-[#001326] rounded"
            />
            <textarea
              name="questionContent"
              value={newQuestion.questionContent}
              onChange={handleInputChange}
              placeholder="Question Content"
              className="w-full p-2 bg-[#001326] rounded"
            />
            {newQuestion.questionOptions?.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="w-full p-2 bg-[#001326] rounded"
              />
            ))}
            <textarea
              name="questionAnswerNotes"
              value={newQuestion.questionAnswerNotes}
              onChange={handleInputChange}
              placeholder="Answer Notes"
              className="w-full p-2 bg-[#001326] rounded"
            />
            <input
              type="text"
              name="contentCategory"
              value={newQuestion.contentCategory}
              onChange={handleInputChange}
              placeholder="Content Category"
              className="w-full p-2 bg-[#001326] rounded"
            />
            <input
              type="text"
              name="passageId"
              value={newQuestion.passageId}
              onChange={handleInputChange}
              placeholder="Passage ID (optional)"
              className="w-full p-2 bg-[#001326] rounded"
            />
            <input
              type="text"
              name="categoryId"
              value={newQuestion.categoryId}
              onChange={handleInputChange}
              placeholder="Category ID"
              className="w-full p-2 bg-[#001326] rounded"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
              Add Question
            </button>
          </form>
        </div>
        
        <div className="bg-[#0A2744] p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Questions List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Question ID</th>
                  <th className="px-6 py-3">Content</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-b bg-[#0A2744] border-gray-700 hover:bg-[#0A2744]/80">
                    <td className="px-6 py-4">{q.id}</td>
                    <td className="px-6 py-4">{q.questionID}</td>
                    <td className="px-6 py-4">{q.questionContent.substring(0, 50)}...</td>
                    <td className="px-6 py-4">{q.category?.contentCategory || "N/A"}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                      <button className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuickActionsCard />
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
};



interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-[#0A2744] p-6 rounded-lg flex items-center">
    <div className="mr-4 text-blue-400">{icon}</div>
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const RecentActivityCard = () => (
  <div className="bg-[#0A2744] p-6 rounded-lg">
    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
    <ul className="space-y-3">
      <li className="flex items-center">
        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
        <span>New question added</span>
        <span className="ml-auto text-sm text-gray-400">2 min ago</span>
      </li>
      <li className="flex items-center">
        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
        <span>Question updated</span>
        <span className="ml-auto text-sm text-gray-400">1 hour ago</span>
      </li>
      <li className="flex items-center">
        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
        <span>Question deleted</span>
        <span className="ml-auto text-sm text-gray-400">3 hours ago</span>
      </li>
    </ul>
  </div>
);

const QuickActionsCard = () => (
  <div className="bg-[#0A2744] p-6 rounded-lg">
    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
    <div className="grid grid-cols-2 gap-4">
      <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
        Add New Question
      </button>
      <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
        Create Test
      </button>
      <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded">
        View Reports
      </button>
      <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded">
        System Settings
      </button>
    </div>
  </div>
);

export default AdminPage;