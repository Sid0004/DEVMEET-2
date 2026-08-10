import React, { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { addMessage, incrementUnread, resetUnread, setTypingUser, removeTypingUser } from "@/redux/features/chatSlice";
import styles from "../../app/workspace/workspace.module.css";
import Avatar from "@/components/Avatar";

export default function ChatPanel({ socket, connectedUsers, roomUsers, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'members'
  const [chatInput, setChatInput] = useState("");
  const dispatch = useAppDispatch();
  const { messages, unreadCount, typingUsers } = useAppSelector((state) => state.chat);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle socket listeners for chat
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      dispatch(addMessage(msg));
      if (!isOpen || activeTab !== "chat") {
        dispatch(incrementUnread());
      }
    };

    const handleUserTyping = ({ user }) => {
      dispatch(setTypingUser(user));
    };

    const handleUserStoppedTyping = ({ userId }) => {
      dispatch(removeTypingUser(userId));
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stopped-typing", handleUserStoppedTyping);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stopped-typing", handleUserStoppedTyping);
    };
  }, [socket, isOpen, activeTab, dispatch]);

  // Scroll chat to bottom when a new message arrives
  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    socket.emit("send-message", { message: chatInput.trim() });
    setChatInput("");
    socket.emit("stop-typing");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (e) => {
    setChatInput(e.target.value);
    if (!socket) return;
    
    socket.emit("typing");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing");
    }, 2000);
  };

  const toggleChat = () => {
    if (!isOpen) {
      dispatch(resetUnread());
    }
    setIsOpen(!isOpen);
  };

  const allMembers = [
    { socketId: "self", user, isMe: true },
    ...connectedUsers.map((c) => ({ ...c, isMe: false })),
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          className={styles.chatToggleButton} 
          onClick={toggleChat}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>chat</span>
          Team Chat
          {unreadCount > 0 && (
            <span className={styles.chatToggleButtonBadge}>{unreadCount}</span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      <div className={`${styles.chatSection} ${!isOpen ? styles.chatSectionHidden : ""}`}>
        {/* Header Navigation */}
        <div className={styles.chatHeader}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => {
                setActiveTab("chat");
                dispatch(resetUnread());
              }}
              style={{
                background: "none",
                border: "none",
                color: activeTab === "chat" ? "#3b82f6" : "rgba(255, 255, 255, 0.6)",
                fontWeight: activeTab === "chat" ? 600 : 400,
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "2px 0",
                borderBottom: activeTab === "chat" ? "2px solid #3b82f6" : "none",
              }}
            >
              Chat {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setActiveTab("members")}
              style={{
                background: "none",
                border: "none",
                color: activeTab === "members" ? "#3b82f6" : "rgba(255, 255, 255, 0.6)",
                fontWeight: activeTab === "members" ? 600 : 400,
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "2px 0",
                borderBottom: activeTab === "members" ? "2px solid #3b82f6" : "none",
              }}
            >
              Members ({allMembers.length})
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button 
              onClick={toggleChat}
              style={{
                background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center'
              }}
              title="Minimize Chat"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>expand_more</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Chat Messages */}
        {activeTab === "chat" && (
          <>
            <div className={styles.chatMessages}>
              {messages.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "rgba(255, 255, 255, 0.4)",
                    textAlign: "center",
                    marginTop: "2rem",
                  }}
                >
                  No messages yet. Send a message to start chatting!
                </p>
              ) : (
                messages.map((msg, index) => {
                  if (msg.type === "system") {
                    return (
                      <div key={index} className={styles.msgSystem}>
                        {msg.text}
                      </div>
                    );
                  }
                  const isMe = msg.sender?._id === user?._id;
                  return (
                    <div
                      key={index}
                      className={isMe ? styles.msgLocal : styles.msgRemote}
                    >
                      <p className={styles.msgMeta}>
                        {isMe
                          ? "You"
                          : msg.sender?.fullName || msg.sender?.username || "Peer"}{" "}
                        • {msg.timestamp}
                      </p>
                      <div
                        className={
                          isMe ? styles.msgBubbleLocal : styles.msgBubbleRemote
                        }
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div style={{ padding: "4px 12px", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", fontStyle: "italic", backgroundColor: "#1e1e1e" }}>
                {typingUsers.map(u => u.fullName || u.username).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
              </div>
            )}

            <form onSubmit={handleSendMessage} className={styles.chatInputContainer}>
              <input
                type="text"
                placeholder="Send a message..."
                className={styles.chatInput}
                value={chatInput}
                onChange={handleTyping}
              />

              <button type="submit" className={styles.chatSendBtn}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  send
                </span>
              </button>
            </form>
          </>
        )}

        {/* Tab 2: Online Roster Members */}
        {activeTab === "members" && (
          <div className={styles.chatMessages} style={{ padding: "0.75rem" }}>
            <h5 style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
              Active in Session ({allMembers.length})
            </h5>
            {allMembers.map((member, i) => {
              const name = member.isMe
                ? `${member.user?.fullName || member.user?.username || "You"} (You)`
                : member.user?.fullName || member.user?.username || "Participant";
              const isInCall = roomUsers.some(
                (ru) => ru.socketId === member.socketId || ru.user?._id === member.user?._id
              );

              return (
                <div
                  key={member.socketId || i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "6px",
                    marginBottom: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar src={member.user?.avatar || member.user?.avatarUrl || null} name={name} size={24} />
                    <span style={{ fontSize: "0.8125rem", color: "#f3f3f3", fontWeight: member.isMe ? 600 : 400 }}>
                      {name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#4ade80",
                        display: "inline-block",
                      }}
                      title="Online"
                    />
                    <span style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.5)" }}>
                      {isInCall ? "In Call" : "Coding"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

