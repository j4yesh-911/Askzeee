
import React from "react";
import {
  Plus,
  Pin,
  MessageSquare,
  Send,
  Trash2,
  MoreHorizontal,
  Sparkles,
  PanelLeftClose,
  Menu,
  Pencil,
  X
} from "lucide-react";

import {
  getConversations,
  getConversation,
  sendMessage,
  pinConversation,
  renameConversation,
  deleteConversation
} from "./services/api";

function App() {
  const [chats, setChats] = React.useState([]);
  const [activeChat, setActiveChat] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingChats, setLoadingChats] = React.useState(true);

  const [sidebarOpen, setSidebarOpen] = React.useState(
    () => window.innerWidth > 768
  );

  const [menuChat, setMenuChat] = React.useState(null);
  const [error, setError] = React.useState("");

  const messagesEndRef = React.useRef(null);

  const loadChats = async () => {
    try {
      const data = await getConversations();
      setChats(data);
    } catch (err) {
      setError("Unable to load chat history. Check your backend.");
    } finally {
      setLoadingChats(false);
    }
  };

  React.useEffect(() => {
    loadChats();
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  const openChat = async (id) => {
    if (loading) return;

    try {
      setError("");
      setActiveChat(id);
      setMessages([]);
      setMenuChat(null);

      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }

      const data = await getConversation(id);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const newChat = () => {
    if (loading) return;

    setActiveChat(null);
    setMessages([]);
    setMessage("");
    setError("");
    setMenuChat(null);

    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleSend = async () => {
    const text = message.trim();

    if (!text || loading) return;

    const chatId = activeChat;

    setMessages(prev => [
      ...prev,
      { role: "user", content: text }
    ]);

    setMessage("");
    setLoading(true);
    setError("");

    try {
      const data = await sendMessage(chatId, text);

      if (!chatId) {
        setActiveChat(data.chatId);
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);

      const updatedChats = await getConversations();
      setChats(updatedChats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async (id) => {
    try {
      const updatedChat = await pinConversation(id);

      setChats(prev =>
        prev.map(chat =>
          chat._id === id ? updatedChat : chat
        )
      );
    } catch (err) {
      setError(err.message);
    }

    setMenuChat(null);
  };

  const handleRename = async (id) => {
    const chat = chats.find(c => c._id === id);

    const title = window.prompt(
      "Enter new chat name:",
      chat?.title
    );

    if (!title?.trim()) {
      setMenuChat(null);
      return;
    }

    try {
      const updatedChat = await renameConversation(id, title.trim());

      setChats(prev =>
        prev.map(c =>
          c._id === id ? updatedChat : c
        )
      );
    } catch (err) {
      setError(err.message);
    }

    setMenuChat(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteConversation(id);

      setChats(prev =>
        prev.filter(c => c._id !== id)
      );

      if (activeChat === id) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message);
    }

    setMenuChat(null);
  };

  const pinnedChats = chats.filter(c => c.pinned);
  const historyChats = chats.filter(c => !c.pinned);

  const ChatItem = ({ chat }) => (
    <div
      className={`chat-item ${
        activeChat === chat._id ? "selected" : ""
      }`}
    >
      <button
        className="chat-title"
        onClick={() => openChat(chat._id)}
      >
        {chat.pinned
          ? <Pin size={15} />
          : <MessageSquare size={15} />
        }

        <span>{chat.title}</span>
      </button>

      <div className="chat-menu-wrapper">
        <button
          className="chat-menu-button"
          aria-label="Chat options"
          onClick={() =>
            setMenuChat(
              menuChat === chat._id ? null : chat._id
            )
          }
        >
          <MoreHorizontal size={17} />
        </button>

        {menuChat === chat._id && (
          <div className="chat-dropdown">
            <button onClick={() => handlePin(chat._id)}>
              <Pin size={14} />
              {chat.pinned ? "Unpin chat" : "Pin chat"}
            </button>

            <button onClick={() => handleRename(chat._id)}>
              <Pencil size={14} />
              Rename
            </button>

            <button
              className="delete-option"
              onClick={() => handleDelete(chat._id)}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="app">

      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

        <div className="brand">
          <div className="brand-logo">A</div>
          <span>Askzeee</span>

          <button
            className="collapse-button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="mobile-close-icon" size={20} />
            <PanelLeftClose className="desktop-close-icon" size={19} />
          </button>
        </div>

        <button className="new-chat" onClick={newChat}>
          <Plus size={18} />
          New Chat
        </button>

        <div className="sidebar-section">
          <p className="section-heading">PINNED CHATS</p>

          {pinnedChats.length > 0 ? (
            pinnedChats.map(chat => (
              <ChatItem key={chat._id} chat={chat} />
            ))
          ) : (
            <p className="empty-label">No pinned chats</p>
          )}
        </div>

        <div className="sidebar-section history">
          <p className="section-heading">CHAT HISTORY</p>

          {loadingChats ? (
            <p className="empty-label">Loading chats...</p>
          ) : historyChats.length > 0 ? (
            historyChats.map(chat => (
              <ChatItem key={chat._id} chat={chat} />
            ))
          ) : (
            <p className="empty-label">No chat history</p>
          )}
        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">
          <div className="topbar-left">

            {!sidebarOpen && (
              <button
                className="topbar-icon"
                aria-label="Open sidebar"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={21} />
              </button>
            )}

            <span>Askzeee</span>
          </div>

          <div className="model-label">
          </div>
        </header>

        <section className={`chat-area ${
          messages.length > 0 ? "has-messages" : "welcome-area"
        }`}>

          {messages.length === 0 && (
            <div className="welcome-content">
              <div className="welcome-icon">
                <Sparkles size={26} />
              </div>

              <h1>What can I help with?</h1>

              <p className="welcome-description">
                Your thoughts, questions, and ideas start here.
              </p>
            </div>
          )}

          {messages.length > 0 && (
            <div className="messages-container">

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-row ${
                    msg.role === "user"
                      ? "user-message"
                      : "ai-message"
                  }`}
                >
                  <div className="message-content">
                    <strong>
                      {msg.role === "user" ? "You" : "Askzeee"}
                    </strong>

                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message-row ai-message">
                  <div className="message-content">
                    <strong>Askzeee</strong>
                    <p className="typing">Thinking...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {error && (
            <p className="error-message">{error}</p>
          )}

          <div className="message-box">
            <textarea
              placeholder="Message Askzeee..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
            />

            <div className="message-bottom">
              <span>Askzeee AI</span>

              <button
                className="send-button"
                onClick={handleSend}
                disabled={!message.trim() || loading}
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </div>
          </div>

          <small className="disclaimer">
            Askzeee can make mistakes. Verify important information.
          </small>

        </section>
      </main>
    </div>
  );
}

export default App;
