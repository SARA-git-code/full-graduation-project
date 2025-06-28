import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5050/api",
  withCredentials: true,
});

// 💬 Messaging APIs

// ✅ جلب المحادثات
export const fetchConversations = () => api.get("/conversations");

// ✅ جلب رسائل محادثة معينة
export const fetchMessages = (conversationId) =>
  api.get(`/messages/conversation/${conversationId}`);

export const deleteMessage = async (id) => {
  const res = await api.delete(`/messages/${id}`);
  return res.data;
};
// ✅ إرسال رسالة نصية
export const sendMessage = async (conversationId, content) => {
  return await api.post("/messages", {
    conversationId,
    content,
  });
};

// ✅ جلب أو إنشاء محادثة مع مستخدم معين (مثل المتبرع)
export const getOrCreateConversation = async (userId, donationId) => {
  const res = await api.get(`/conversations/${userId}/${donationId}`);
  return res.data; // يجب أن يحتوي على _id
};

api.interceptors.request.use((config) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
