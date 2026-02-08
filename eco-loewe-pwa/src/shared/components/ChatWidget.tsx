import { useState, useRef, useEffect } from "react";
import { Api } from "../api/endpoints";
import { useSettings } from "../context/SettingsContext";
import "../../styles/components/chat-widget.css";

interface Message {
  role: "user" | "lion";
  text: string;
}

export default function ChatWidget() {
  const { language, t } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "lion", text: t("chat.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update greeting when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 0 && prev[0].role === "lion") {
        return [{ ...prev[0], text: t("chat.greeting") }, ...prev.slice(1)];
      }
      return prev;
    });
  }, [language, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);



  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const { reply } = await Api.chat(userMsg, language);
      setMessages((prev) => [...prev, { role: "lion", text: reply }]);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.message?.includes("quota")
        ? "🦁 Roar! You've used all your messages for today. Come back tomorrow!"
        : "🦁 Something went wrong. Try again later.";
      setMessages((prev) => [...prev, { role: "lion", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        className="chatWidgetButton"
        onClick={() => setIsOpen(true)}
        aria-label="Open Chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="chatWidgetWindow">
      <div className="chatHeader">
        <span>EcoLion Chat 🦁</span>
        <button className="closeBtn" onClick={() => setIsOpen(false)}>×</button>
      </div>
      <div className="chatMessages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="message lion typing">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatInputArea">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about CO2..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}
