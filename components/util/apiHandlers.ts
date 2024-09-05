export const handleUpdateKnowledgeProfile = async () => {
  //todo, make this look nicer
  try {
    const response = await fetch("/api/knowledge-profile/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to update knowledge profile");
    }
    console.log(response)
  } catch (error) {
    console.error("Error updating knowledge profile:", error);
  } 
};