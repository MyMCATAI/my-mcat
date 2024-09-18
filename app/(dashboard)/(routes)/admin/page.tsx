// "use client";
// import React, { useState, useEffect } from 'react';
// import { Users, FileText, Settings, BarChart2, Edit, Trash2 } from 'lucide-react';

// // Updated Question interface to match our new schema
// interface Question {
//   id: string;
//   questionID: string;
//   questionContent: string;
//   questionOptions: string[];
//   questionAnswerNotes?: string;
//   contentCategory: string;
//   passageId?: string;
//   categoryId: string;
//   category?: {
//     subjectCategory: string;
//     contentCategory: string;
//     conceptCategory: string;
//   };
// }

const AdminPage = () => {
  // const [questions, setQuestions] = useState<Question[]>([]);
  // const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
  //   questionID: '',
  //   questionContent: '',
  //   questionOptions: ['', '', '', ''],
  //   questionAnswerNotes: '',
  //   contentCategory: '',
  //   passageId: '',
  //   categoryId: '',
  // });

  // useEffect(() => {
  //   fetchQuestions();
  // }, []);

  // const fetchQuestions = async () => {
  //   console.log("fetchQuestions")
  //   try {
  //     const response = await fetch('/api/question');
  //     if (!response.ok) throw new Error('Failed to fetch questions');
  //     const data = await response.json();
  //     setQuestions(data.questions);
  //     console.log("data",data)
  //   } catch (error) {
  //     console.error('Error fetching questions:', error);
  //   }
  // };

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setNewQuestion(prev => ({ ...prev, [name]: value }));
  // };

  // const handleOptionChange = (index: number, value: string) => {
  //   setNewQuestion(prev => ({
  //     ...prev,
  //     questionOptions: prev.questionOptions?.map((opt, i) => i === index ? value : opt) || [],
  //   }));
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     const response = await fetch('/api/question', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         ...newQuestion,
  //         questionOptions: newQuestion.questionOptions?.join('|'),
  //       }),
  //     });
  //     if (!response.ok) throw new Error('Failed to add question');
  //     fetchQuestions(); // Refresh the question list
  //     setNewQuestion({ // Reset the form
  //       questionID: '',
  //       questionContent: '',
  //       questionOptions: ['', '', '', ''],
  //       questionAnswerNotes: '',
  //       contentCategory: '',
  //       passageId: '',
  //       categoryId: '',
  //     });
  //   } catch (error) {
  //     console.error('Error adding question:', error);
  //   }
  // };

  return <p>shhhh..</p>;
};

// interface StatCardProps {
//   title: string;
//   value: string;
//   icon: React.ReactNode;
// }

// const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
//   <div className="bg-[#0A2744] p-6 rounded-lg flex items-center">
//     <div className="mr-4 text-blue-400">{icon}</div>
//     <div>
//       <h2 className="text-lg font-semibold">{title}</h2>
//       <p className="text-2xl font-bold">{value}</p>
//     </div>
//   </div>
// );

// const RecentActivityCard = () => (
//   <div className="bg-[#0A2744] p-6 rounded-lg">
//     <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
//     <ul className="space-y-3">
//       <li className="flex items-center">
//         <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
//         <span>New question added</span>
//         <span className="ml-auto text-sm text-gray-400">2 min ago</span>
//       </li>
//       <li className="flex items-center">
//         <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
//         <span>Question updated</span>
//         <span className="ml-auto text-sm text-gray-400">1 hour ago</span>
//       </li>
//       <li className="flex items-center">
//         <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
//         <span>Question deleted</span>
//         <span className="ml-auto text-sm text-gray-400">3 hours ago</span>
//       </li>
//     </ul>
//   </div>
// );

// const QuickActionsCard = () => (
//   <div className="bg-[#0A2744] p-6 rounded-lg">
//     <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
//     <div className="grid grid-cols-2 gap-4">
//       <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
//         Add New Question
//       </button>
//       <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
//         Create Test
//       </button>
//       <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded">
//         View Reports
//       </button>
//       <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded">
//         System Settings
//       </button>
//     </div>
//   </div>
// );

export default AdminPage;
