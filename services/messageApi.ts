interface SendMessageResponse {
  success: boolean;
  error?: string;
}

export const messageApi = {
  sendMessage: async (message: string): Promise<SendMessageResponse> => {
    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
};