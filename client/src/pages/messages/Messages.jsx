import "./messages.scss";
import { useState } from "react";

const conversations = [
  { id: 1, name: "Nguyễn Văn A", avatar: "https://randomuser.me/api/portraits/men/32.jpg", online: true, lastMsg: "Hẹn gặp lại nhé!" },
  { id: 2, name: "Trần Thị B", avatar: "https://randomuser.me/api/portraits/women/44.jpg", online: false, lastMsg: "Cảm ơn bạn nhiều!" },
  { id: 3, name: "Lê Văn C", avatar: "https://randomuser.me/api/portraits/men/65.jpg", online: true, lastMsg: "Đã nhận được file!" },
];

const Messages = () => {
  const [selected, setSelected] = useState(conversations[0]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { fromMe: false, text: "Chào bạn!" },
    { fromMe: true, text: "Chào bạn, có việc gì không?" },
    { fromMe: false, text: "Bạn rảnh không?" },
  ]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { fromMe: true, text: input }]);
      setInput("");
    }
  };

  return (
    <div className="messages-page">
      <aside className="sidebar">
        <h2>Tin nhắn</h2>
        <input className="search" placeholder="Tìm kiếm..." />
        <div className="conversation-list">
          {conversations.map(conv => (
            <div
              className={`conversation ${selected.id === conv.id ? "active" : ""}`}
              key={conv.id}
              onClick={() => setSelected(conv)}
            >
              <img src={conv.avatar} alt={conv.name} />
              <div className="info">
                <span className="name">{conv.name}</span>
                <span className="lastMsg">{conv.lastMsg}</span>
              </div>
              {conv.online && <span className="online-dot" />}
            </div>
          ))}
        </div>
      </aside>
      <main className="chat-main">
        <div className="chat-header">
          <img src={selected.avatar} alt={selected.name} />
          <div className="info">
            <span className="name">{selected.name}</span>
            <span className="status">{selected.online ? "Đang hoạt động" : "Ngoại tuyến"}</span>
          </div>
        </div>
        <div className="chat-body">
          {messages.map((msg, idx) => (
            <div className={`msg ${msg.fromMe ? "me" : "other"}`} key={idx}>
              <span>{msg.text}</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            onKeyDown={e => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Gửi</button>
        </div>
      </main>
    </div>
  );
};

export default Messages;
