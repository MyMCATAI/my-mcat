import { Test, UserTest, UserResponse, Passage } from '@/types';

export const testApi = {
  fetchTest: async (testId: string): Promise<Test> => {
    const response = await fetch(`/api/test?id=${testId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch test");
    }
    return response.json();
  },

  createUserTest: async (testId: string): Promise<UserTest> => {
    const response = await fetch("/api/user-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create user test");
    }
    return response.json();
  },

  fetchPassage: async (passageId: string): Promise<Passage> => {
    const encodedPassageId = encodeURIComponent(passageId);
    const response = await fetch(`/api/passage?id=${encodedPassageId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch passage");
    }
    return response.json();
  },

  saveUserResponse: async (response: Partial<UserResponse>): Promise<UserResponse> => {
    const apiResponse = await fetch("/api/user-test/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    if (!apiResponse.ok) {
      throw new Error(`Failed to save user response: ${apiResponse.status}`);
    }

    return apiResponse.json();
  },

  updateTestScore: async (userTestId: string, data: {
    score: number;
    finishedAt: string;
    totalTime: number;
  }): Promise<void> => {
    const response = await fetch(`/api/user-test/${userTestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update test score");
    }
  },

  updateUserScore: async (amount: number): Promise<void> => {
    const response = await fetch("/api/user-info/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user score");
    }
  },
};