import "./gallery.scss";
import { useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1515168833906-d2a3b82b3029",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1515168833906-d2a3b82b3029",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
];

const Gallery = () => {
  const [modalImg, setModalImg] = useState(null);
  return (
    <div className="gallery-page">
      <h1>Gallery</h1>
      <div className="gallery-grid">
        {images.map((img, idx) => (
          <div className="gallery-img" key={idx} onClick={() => setModalImg(img)}>
            <img src={img} alt="gallery" />
          </div>
        ))}
      </div>
      {modalImg && (
        <div className="modal" onClick={() => setModalImg(null)}>
          <img src={modalImg} alt="large" />
        </div>
      )}
    </div>
  );
};

export default Gallery;
