import React, { useEffect, useRef, useState } from "react";

import { fetchMessages, sendMessage, deleteMessage } from "../api";
import socket from "../sockets/socket";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  FiImage,
  FiVideo,
  FiFileText,
  FiMic,
  FiTrash2,
  FiMapPin,
  FiPlus,
  FiStopCircle,
} from "react-icons/fi";

const ChatBox = ({ conversation, partner, onBack }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  const { user: currentUser } = useUserContext();

  const isReady = conversation?._id && partner?._id;
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("register", currentUser._id);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    if (!conversation?._id) return;
    fetchMessages(conversation._id).then((res) => setMessages(res.data || []));
  }, [conversation?._id]);

  useEffect(() => {
    const handleIncoming = (msg) => {
      console.log("📥 Incoming real-time message:", msg);
      if (msg.conversationId === conversation?._id) {
        setMessages((prev) => {
          const alreadyExists = prev.some((m) => m._id === msg._id);
          if (alreadyExists) return prev; // ⚠️ لا تضف الرسالة إذا كانت موجودة
          return [...prev, msg]; // ✅ أضفها إذا كانت جديدة فقط
        });
      }
    };
    const handleDeleted = ({ messageId, conversationId }) => {
      if (conversationId === conversation._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, deleted: true, content: "", attachment: null }
              : msg
          )
        );
      }
    };
    socket.off("newMessage");
    socket.on("newMessage", handleIncoming);
    socket.on("messageDeleted", handleDeleted);
    return () => {
      socket.off("newMessage", handleIncoming);
      socket.off("messageDeleted", handleDeleted);
    };
  }, [conversation?._id]);

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text) return;
    try {
      const res = await fetch("http://localhost:5050/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId: conversation._id,
          content: text,
          receiver: partner._id,
          type: "text",
        }),
      });
      const data = await res.json();
      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: partner._id,
        message: data,
      });
      // setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error("❌ Failed to send message:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id
            ? { ...msg, deleted: true, content: "", attachment: null }
            : msg
        )
      );
      socket.emit("messageDeleted", {
        messageId: id,
        conversationId: conversation._id,
      });
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", conversation._id);
    const res = await fetch("http://localhost:5050/api/messages", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    socket.emit("sendMessage", {
      senderId: currentUser._id,
      receiverId: partner._id,
      message: data,
    });
    // setMessages((prev) => [...prev, data]);
    setShowOptions(false);
  };

  const sendLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const res = await fetch("http://localhost:5050/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "location",
          content: `https://www.google.com/maps?q=${lat},${lng}`,
          location: { lat, lng },
          conversationId: conversation._id,
          receiver: partner._id,
        }),
      });
      const data = await res.json();
      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: partner._id,
        message: data,
      });
      // setMessages((prev) => [...prev, data]);
      setShowOptions(false);
    });
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob, "voice-message.webm");
      formData.append("conversationId", conversation._id);
      const res = await fetch("http://localhost:5050/api/messages", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: partner._id,
        message: data,
      });
      // setMessages((prev) => [...prev, data]);
    };
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isReady || !partner) {
    return (
      <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
        Select a conversation to start messaging.
      </div>
    );
  }

  return (
    // <div className="flex-grow-1 d-flex flex-column">
    <div
      className="d-flex flex-column"
      style={{
        flex: 1,
        height: "100%",
        marginTop: "80px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="chat-header border-bottom p-3 d-flex align-items-center"
        style={{ flexShrink: 0, marginTop: "80px" }}
      >
        {isMobile && (
          <button onClick={onBack} className="btn btn-outline-secondary me-3">
            ← Back
          </button>
        )}
        <div
          className="d-flex align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/profile/${partner._id}`)}
        >
          <img
            src={
              partner.profileImage
                ? `http://localhost:5050/uploads/${partner.profileImage}`
                : "/default-user.png"
            }
            alt="avatar"
            className="rounded-circle me-2"
            style={{ width: 40, height: 40, objectFit: "cover" }}
          />
          <div>
            <div className="fw-bold">{partner.name}</div>
            <div className="text-muted" style={{ fontSize: "0.85rem" }}>
              {partner.email}
            </div>
          </div>
        </div>
      </div>

      <div
        className="chat-messages flex-grow-1 px-3 py-2"
        style={{
          overflowY: "auto",
          flex: 1,
          
        }}
      >
        {messages.map((msg) => {
          const isMine =
            String(msg.sender?._id || msg.sender) === String(currentUser._id);
          const isText = msg.type === "text";

          return (
            <div
              key={msg._id}
              className={`d-flex mb-2 ${
                isMine ? "justify-content-end" : "justify-content-start"
              }`}
            >
              <div
                className="position-relative"
                style={{
                  backgroundColor: isText
                    ? isMine
                      ? "#0d6efd"
                      : "#e2efff"
                    : "transparent",
                  color: isText ? (isMine ? "#fff" : "#000") : "#000",
                  borderRadius: isText
                    ? isMine
                      ? "18px 18px 0 18px"
                      : "18px 18px 18px 0"
                    : 12,
                  maxWidth: "75%",
                  padding: isText ? "10px 14px" : 0,
                  fontSize: "0.95rem",
                   wordBreak: "break-word", // ✅ أضف هذا السطر
  overflowWrap: "break-word", // ✅ مهم جدًا لمنع التمدد الأفقي
  whiteSpace: "pre-wrap",
                }}
              >
                {isMine && !msg.deleted && isText && (
                  <FiTrash2
                    onClick={() => {
                      if (window.confirm("Delete this message?"))
                        handleDelete(msg._id);
                    }}
                    style={{
                      position: "absolute",
                      top: 5,
                      left: -26,
                      cursor: "pointer",
                      color: "#dc3545",
                      background: "#fff",
                      borderRadius: "50%",
                      padding: 3,
                      boxShadow: "0 0 4px rgba(0,0,0,0.15)",
                      zIndex: 10,
                    }}
                  />
                )}

                {msg.deleted ? (
                  <em className="text-muted">This message was deleted</em>
                ) : msg.type === "text" ? (
                  msg.content
                ) : msg.type === "image" ? (
                  <img
                    src={`http://localhost:5050/uploads/${msg.attachment}`}
                    style={{ maxWidth: 180, borderRadius: 10 }}
                  />
                ) : msg.type === "video" ? (
                  <video
                    controls
                    src={`http://localhost:5050/uploads/${msg.attachment}`}
                    style={{ maxWidth: 200 }}
                  />
                ) : msg.type === "audio" ? (
                  <audio
                    controls
                    src={`http://localhost:5050/uploads/${msg.attachment}`}
                    style={{ height: 32, width: 160 }}
                  />
                ) : msg.type === "file" ? (
                  <a
                    href={`http://localhost:5050/uploads/${msg.attachment}`}
                    download
                  >
                    Download File
                  </a>
                ) : msg.type === "location" &&
                  msg.location?.lat &&
                  msg.location?.lng ? (
                  <iframe
                    title="Google Maps"
                    width="200"
                    height="160"
                    style={{ border: 0, borderRadius: 8 }}
                    src={`https://www.google.com/maps/embed/v1/view?key=${googleMapsKey}&center=${msg.location.lat},${msg.location.lng}&zoom=16`}
                    allowFullScreen
                  ></iframe>
                ) : null}

                {msg.createdAt && (
                  <div
                    className="text-muted small mt-1"
                    style={{
                      fontSize: "0.7rem",
                      textAlign: isMine ? "right" : "left",
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div
        className="p-3 border-top d-flex align-items-center gap-2 bg-white"
        style={{ flexShrink: 0 }}
      >
        <div className="position-relative">
          <button
            className="btn btn-light border"
            onClick={() => setShowOptions(!showOptions)}
          >
            <FiPlus />
          </button>
          {showOptions && (
            <div
              className="position-absolute bg-white border rounded shadow p-2"
              style={{ bottom: "100%", left: 0, zIndex: 10 }}
            >
              <label className="d-block mb-1" style={{ cursor: "pointer" }}>
                <FiImage /> Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleUpload(e, "image")}
                />
              </label>
              <label className="d-block mb-1" style={{ cursor: "pointer" }}>
                <FiVideo /> Video
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => handleUpload(e, "video")}
                />
              </label>
              <label className="d-block mb-1" style={{ cursor: "pointer" }}>
                <FiFileText /> File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.rar"
                  hidden
                  onChange={(e) => handleUpload(e, "file")}
                />
              </label>
              <button
                className="d-block mb-1 text-start"
                onClick={sendLocation}
              >
                <FiMapPin /> Location
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          className="form-control rounded-pill"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        {recording ? (
          <button
            className="btn btn-danger rounded-circle"
            onClick={stopRecording}
          >
            <FiStopCircle />
          </button>
        ) : (
          <button
            className="btn btn-secondary rounded-circle"
            onClick={startRecording}
          >
            <FiMic />
          </button>
        )}

        <button
          className="btn btn-primary rounded-circle"
          onClick={handleSend}
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
