import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatList from "../components/ChatList";
import ChatBox from "../components/ChatBox";
import { fetchConversations, getOrCreateConversation } from "../api";
import { useUserContext } from "../context/UserContext";
import socket from "../sockets/socket";
import "../styles/ChatResponsive.css";

const Chat = () => {
  const { id } = useParams();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [partner, setPartner] = useState(null);

  const isMobile = window.innerWidth < 768;
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("register", currentUser._id);
      console.log("📡 Registered WebSocket:", currentUser._id);
    }
  }, [currentUser?._id]);

  // ✅ تحميل المحادثات وتحديد المحادثة الحالية
  useEffect(() => {
    const loadConversations = async () => {
      if (!currentUser?._id) return;

      try {
        const res = await fetchConversations();
        const list = Array.isArray(res.data) ? res.data : [];
        setConversations(list);

        let foundConv = list.find((conv) =>
          conv.users?.some((u) => u._id === id)
        );

        if (!foundConv && id) {
          foundConv = await getOrCreateConversation(id);
          setConversations((prev) => [...prev, foundConv]); // ✅ إضافة المحادثة الجديدة للقائمة
        }

        if (foundConv) {
          setSelectedConversation(foundConv);
          const otherUser = foundConv.users.find(
            (u) => u._id !== currentUser._id
          );
          if (otherUser) setPartner(otherUser);
        }
      } catch (err) {
        console.error("❌ Error loading conversations:", err.message);
      }
    };

    loadConversations();
  }, [id, currentUser]);

  // ✅ التحديث عند استقبال رسالة جديدة
  useEffect(() => {
    const handleIncoming = async (newMsg) => {
      console.log("📥 Incoming real-time message:", newMsg);

      // ✅ 1. تحديث المحادثة الحالية إن كانت مفتوحة
      if (selectedConversation?._id === newMsg.conversationId) {
        setSelectedConversation((prev) => ({
          ...prev,
          lastMessage: newMsg,
          triggerRefresh: Date.now(),
        }));
      }

      // ✅ 2. إعادة تحميل المحادثات من السيرفر (لتحديث users + lastMessage معًا)
      try {
        const res = await fetchConversations();
        setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Error reloading conversations:", err.message);
      }
    };

    socket.on("newMessage", handleIncoming);
    return () => socket.off("newMessage", handleIncoming);
  }, [selectedConversation?._id]);

  return (
    <div className={`chat-wrapper ${isMobile ? "mobile" : ""}`}>
      {!isMobile || !showChat ? (
        <div className="chat-sidebar">
          <ChatList
            conversations={conversations.filter((c) => !c.isGroup)}
            selectedId={partner?._id}
            currentUserId={currentUser?._id}
            onSelectConversation={(conv, user) => {
              setSelectedConversation(conv);
              setPartner(user);
              setShowChat(true); // ✅ أظهر ChatBox فقط
              navigate(`/chat/${user._id}`);
            }}
          />
        </div>
      ) : null}

      {(!isMobile || showChat) && (
        <div className="chat-main" style={{ height: "calc(100vh - 50px)" }}>
          <ChatBox
            conversation={selectedConversation}
            partner={partner}
            currentUser={currentUser}
            onBack={() => {
              setShowChat(false);
              navigate("/chat"); // 🧭 العودة لقائمة المحادثات
            }} // ✅ زر الرجوع
          />
        </div>
      )}
    </div>
  );
};

export default Chat;
