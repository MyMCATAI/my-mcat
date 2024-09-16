import React, { useState } from 'react';
import { Plus, Book, HelpCircle, Edit2, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface SearchPageProps {
  onAddNew: () => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onAddNew }) => {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', query);
    // TODO: Implement search functionality
  };

  const dummyPassages = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
    { id: 3, title: '1984', author: 'George Orwell' },
  ];

  const sortedPassages = [...dummyPassages].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'author') {
      return a.author.localeCompare(b.author);
    }
    return 0;
  });

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search through passages..."
          className="flex-grow border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
        <button
          type="button"
          onClick={onAddNew}
          className="ml-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Add Passage"
        >
          <Plus className="h-5 w-5" />
        </button>
      </form>
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black">Passages</h2>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">Sort by Title</option>
              <option value="author">Sort by Author</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <ul className="space-y-4">
          {sortedPassages.map((passage) => (
            <li key={passage.id} className="flex items-center justify-between border-b pb-2">
              <Link href={`/passage/${passage.id}`} className="text-blue-600 hover:underline">
                {passage.title} by {passage.author}
              </Link>
              <div className="flex space-x-2">
                <Link href={`/admin/edit-passage/${passage.id}`}>
                  <button
                    className="p-1 hover:bg-gray-100 rounded group flex items-center"
                    aria-label="Edit Passage"
                  >
                    <Edit2 className="h-5 w-5 text-gray-600" />
                    <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-xs group-hover:ml-2 text-black">
                      Edit passage
                    </span>
                  </button>
                </Link>
                <Link href={`/admin/edit-questions/${passage.id}`}>
                  <button
                    className="p-1 hover:bg-gray-100 rounded group flex items-center"
                    aria-label="Edit Questions"
                  >
                    <HelpCircle className="h-5 w-5 text-gray-600" />
                    <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-xs group-hover:ml-2 text-black">
                      Edit Questions
                    </span>
                  </button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchPage;
