import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatList = ({
  onSelectConversation,
  selectedId,
  conversations,
  currentUserId,
}) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // ✨ استخراج محادثة واحدة لكل شريك
  const uniquePartners = new Map();
  conversations
    .filter((conv) =>
      conv.users?.some((u) => String(u._id) !== String(currentUserId))
    )
    .forEach((conv) => {
      const partner = conv.users.find(
        (u) => String(u._id) !== String(currentUserId)
      );
      if (partner && !uniquePartners.has(partner._id)) {
        uniquePartners.set(partner._id, { conv, partner });
      }
    });

  const filteredConversations = Array.from(uniquePartners.values()).filter(
    ({ partner }) => partner.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="bg-white border-end shadow-sm d-flex flex-column"
      style={{ maxWidth: 320, width: "100%", height: "100%" }}
    >
      <div className="p-3 border-bottom">
        <h5 className="fw-bold mb-2">Messages</h5>
        <input
          className="form-control"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-grow-1 overflow-auto p-2">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(({ conv, partner }) => {
            const isSelected = String(partner._id) === String(selectedId);
            const messageText =
              typeof conv.lastMessage === "string"
                ? conv.lastMessage
                : conv.lastMessage?.deleted
                ? "This message was deleted"
                : conv.lastMessage?.content || "No messages yet";

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv, partner)}
                className={`d-flex align-items-center gap-3 p-2 rounded mb-1 ${
                  isSelected ? "bg-light border" : "hover-bg"
                }`}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={
                    partner.profileImage
                      ? `http://localhost:5050/uploads/${partner.profileImage}`
                      : "/default-user.png"
                  }
                  alt="avatar"
                  className="rounded-circle border"
                  style={{
                    width: 45,
                    height: 45,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${partner._id}`);
                  }}
                />
                <div className="flex-grow-1 overflow-hidden">
                  <div className="fw-bold text-truncate">{partner.name}</div>
                  <div
                    className={`small text-truncate ${
                      isSelected ? "text-dark" : "text-muted"
                    }`}
                    style={{ maxWidth: 200 }}
                  >
                    {messageText.length > 35
                      ? messageText.slice(0, 35) + "..."
                      : messageText}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted mt-4">
            No results match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
