import fetch from "node-fetch";

const testAPI = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/gemini/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Test message"
      })
    });

    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
};

testAPI();
