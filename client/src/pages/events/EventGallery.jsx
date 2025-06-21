import "./eventGallery.scss";

const events = [
  { id: 1, name: "ReactJS Meetup", date: "2025-07-10", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", joined: false },
  { id: 2, name: "Design Sprint", date: "2025-08-01", img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca", joined: true },
  { id: 3, name: "Startup Pitch", date: "2025-09-15", img: "https://images.unsplash.com/photo-1515168833906-d2a3b82b3029", joined: false },
  { id: 4, name: "AI Conference", date: "2025-10-20", img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99", joined: false },
];

const EventGallery = () => {
  return (
    <div className="event-gallery">
      <aside className="sidebar">
        <h2>Sự kiện</h2>
        <ul>
          <li className="active">Tất cả</li>
          <li>Sắp diễn ra</li>
          <li>Đã qua</li>
        </ul>
      </aside>
      <main className="gallery-main">
        <h1>Event Gallery</h1>
        <div className="gallery-grid">
          {events.map(event => (
            <div className="event-card" key={event.id}>
              <img src={event.img} alt={event.name} />
              <div className="event-info">
                <h3>{event.name}</h3>
                <span className="date">{new Date(event.date).toLocaleDateString()}</span>
                <button className={event.joined ? "joined" : "join"}>
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

export default EventGallery;
