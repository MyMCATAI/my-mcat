import React, { useState } from "react";
import {
  Plus,
  Book,
  HelpCircle,
  Edit2,
  ChevronDown,
  Trash2,
  Router,
} from "lucide-react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { Passage } from "@/types";
import { useRouter } from "next/router";

interface SearchPageProps {
  onAddNew: () => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onAddNew }) => {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [passages, setPassages] = useState<Passage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log("Searching for:", query);
    // TODO: Implement search functionality
    try {
      const response = await fetch(
        `/api/search-passages?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch passages");
      }
      if (response === null) {
        throw new Error("No passage by that name");
      }
      const results = await response.json();
      setPassages(results);
    } catch (err) {
      setError("An error occurred while searching for passages");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // const dummyPassages = [
  //   { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  //   { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee" },
  //   { id: 3, title: "1984", author: "George Orwell" },
  // ];

  // const sortedPassages = [...dummyPassages].sort((a, b) => {
  //   if (sortBy === "title") {
  //     return a.title.localeCompare(b.title);
  //   } else if (sortBy === "author") {
  //     return a.author.localeCompare(b.author);
  //   }
  //   return 0;
  // });

  function displaySelectedPassage(passage: Passage) {
    setSelectedPassage(passage);
  }

  const handleDeletePassage = async (passageId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this passage and its questions? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/passage?id=${passageId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete passage");
        }

        // Remove the deleted passage from the state
        setPassages(passages.filter((p) => p.id !== passageId));

        if (selectedPassage && selectedPassage.id === passageId) {
          setSelectedPassage(null);
        }

        alert("Passage and its questions have been deleted successfully.");
      } catch (err) {
        setError("An error occurred while deleting the passage");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

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
          {passages.map((passage) => (
            <li
              key={passage.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <button
                onClick={() => displaySelectedPassage(passage)}
                className="text-blue-600 hover:underline text-left"
              >
                {passage.title}
              </button>
              <div className="flex space-x-2">
                <Link href={`/admin/editpassage/${passage.id}`}>
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
                <Link href={`/admin/editquestions/${passage.id}`}>
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
                <button
                  onClick={() => handleDeletePassage(passage.id)}
                  className="p-1 hover:bg-gray-100 rounded group flex items-center"
                  aria-label="Delete Passage"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-xs group-hover:ml-2 text-black">
                    Delete
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* {selectedPassage && (
        <div className="mt-8 border p-4 rounded">
          <h3 className="font-bold">{selectedPassage.title}</h3>
          <div dangerouslySetInnerHTML={{ __html: selectedPassage.text }} />
          <p className="text-sm text-gray-600 mt-2">
            {selectedPassage.citation}
          </p>
        </div>
      )} */}

      {/* <ul className="space-y-4">
        {passages.map((passage) => (
          <li
            key={passage.id}
            className="flex items-center justify-between border-b pb-2"
          >
            <button
              onClick={() => displaySelectedPassage(passage)}
              className="text-blue-600 hover:underline text-left"
            >
              {passage.title}
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditPassage(passage.id)}
                className="p-1 hover:bg-gray-100 rounded group flex items-center"
                aria-label="Edit Passage"
              >
                <Edit2 className="h-5 w-5 text-gray-600" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-xs group-hover:ml-2 text-black">
                  Edit passage
                </span>
              </button>
              <button
                onClick={() => handleEditQuestions(passage.id)}
                className="p-1 hover:bg-gray-100 rounded group flex items-center"
                aria-label="Edit Questions"
              >
                <HelpCircle className="h-5 w-5 text-gray-600" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-xs group-hover:ml-2 text-black">
                  Edit Questions
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default SearchPage;
