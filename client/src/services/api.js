
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Generate or retrieve anonymous user ID
let userId = localStorage.getItem("askzeee_user_id");

if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("askzeee_user_id", userId);
}

// Common request helper
const userQuery = `userId=${encodeURIComponent(userId)}`;

// GET all conversations
export const getConversations = async () => {
  const response = await fetch(
    `${API_URL}/conversations?${userQuery}`
  );

  if (!response.ok) {
    throw new Error("Failed to load chats");
  }

  return response.json();
};

// GET one conversation
export const getConversation = async (id) => {
  const response = await fetch(
    `${API_URL}/conversations/${id}?${userQuery}`
  );

  if (!response.ok) {
    throw new Error("Failed to load conversation");
  }

  return response.json();
};

// SEND message
export const sendMessage = async (chatId, message) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chatId,
      message,
      userId
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send message");
  }

  return data;
};

// CREATE conversation
export const createConversation = async (title) => {
  const response = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      userId
    })
  });

  if (!response.ok) {
    throw new Error("Failed to create chat");
  }

  return response.json();
};

// PIN / UNPIN conversation
export const pinConversation = async (id) => {
  const response = await fetch(
    `${API_URL}/conversations/${id}/pin`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId })
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update pin");
  }

  return response.json();
};

// RENAME conversation
export const renameConversation = async (id, title) => {
  const response = await fetch(
    `${API_URL}/conversations/${id}/rename`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        userId
      })
    }
  );

  if (!response.ok) {
    throw new Error("Failed to rename chat");
  }

  return response.json();
};

// DELETE conversation
export const deleteConversation = async (id) => {
  const response = await fetch(
    `${API_URL}/conversations/${id}?${userQuery}`,
    {
      method: "DELETE"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete chat");
  }

  return response.json();
};
