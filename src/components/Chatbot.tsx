import React, { useState, FormEvent } from "react";
import axios from "axios";

interface Message {
  message: string;
  sender: "user" | "bot";
}

const Chatbot: React.FC = () => {
  const [chat, setChat] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage = { message: input, sender: "user" as const };
    setChat([...chat, userMessage]);
    setLoading(true);

    try {
      // Create a conversation history string
      const conversationHistory = chat
        .map((msg) => `${msg.sender === "user" ? "User" : "The Gigster"}: ${msg.message}`)
        .join("\n");

      // Prepend a system prompt to set the tone and task
      const systemPrompt = "You are The Gigster, a helpful AI assistant created by xAI. Respond in a friendly and coherent manner. If the user asks about jobs, provide helpful advice about the job type and suggest where to find job listings (e.g., websites like Indeed, LinkedIn, or Workopolis), but do not generate links. Ensure your response is complete and finishes your thought, but keep it concise (2-3 sentences).";
      const fullPrompt = `${systemPrompt}\n\n${conversationHistory}\nUser: ${input}\nThe Gigster:`;

      const response = await axios.post("/api/huggingface", {
        inputs: fullPrompt,
      });

      const botMessage: string = response.data[0]?.generated_text?.replace(fullPrompt, "").trim() || "Sorry, I could not generate a response.";
      setChat((prevChat) => [...prevChat, { message: botMessage, sender: "bot" }]);
    } catch (error) {
      console.error("Error calling Hugging Face API via proxy:", error.response?.data || error.message);
      let errorMessage = "An unexpected error occurred.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setChat((prevChat) => [
        ...prevChat,
        { message: `Error: ${errorMessage}`, sender: "bot" },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <h1>How can we help you today?</h1>
      <div className="chat-box">
        {chat.map((message, index) => (
          <p key={index} className={message.sender}>
            <strong>{message.sender === "user" ? "You" : "The Gigster"}:</strong> {message.message}
          </p>
        ))}
        {loading && <p className="loading">The Gigster is typing...</p>}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          type="text"
          placeholder="Ask me anything"
          disabled={loading}
        />
        <button type="submit" disabled={loading}></button>
      </form>
    </div>
  );
};

export default Chatbot;