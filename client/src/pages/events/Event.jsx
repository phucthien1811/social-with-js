// Event.jsx

import "./event.scss";

// Dữ liệu mẫu
const events = [
  { id: 1, name: "ReactJS Meetup", date: "2025-07-10", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", joined: false },
  { id: 2, name: "Design Sprint", date: "2025-08-01", img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca", joined: true },
  { id: 3, name: "Startup Pitch", date: "2025-09-15", img: "https://images.unsplash.com/photo-1515168833906-d2a3b82b3029", joined: false },
  { id: 4, name: "AI Conference", date: "2025-10-20", img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99", joined: false },
];

const Event = () => {
  // Định dạng ngày tháng cho đẹp hơn
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  
  return (
    <div className="event-page">
      {/* Sửa lại class của sidebar và thêm class cho các element con */}
      <aside className="event-page__sidebar">
        <h2 className="event-page__sidebar-title">Sự kiện</h2>
        <ul className="event-page__menu">
          <li className="event-page__menu-item active">Tất cả</li>
          <li className="event-page__menu-item">Sắp diễn ra</li>
          <li className="event-page__menu-item">Đã qua</li>
        </ul>
      </aside>

      {/* Sửa lại class của main và thêm class cho h1 */}
      <main className="event-page__main">
        <h1 className="event-page__main-title">Danh sách sự kiện</h1>
        <div className="event-grid">
          {events.map(event => (
            <div className="event-card" key={event.id}>
              {/* Thêm class cho các element của card */}
              <img src={event.img} alt={event.name} className="event-card__image" />
              <div className="event-card__info">
                <h3 className="event-card__title">{event.name}</h3>
                <span className="event-card__date">{formatDate(event.date)}</span>
                
                {/* Sửa lại logic className của button cho đúng chuẩn BEM */}
                <button 
                  className={`custom-button ${event.joined ? 'custom-button--joined' : 'custom-button--primary'}`}
                >
                  {event.joined ? "Đã tham gia" : "Tham gia"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Event;