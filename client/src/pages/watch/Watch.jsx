import { useState, useRef } from "react";
import Video from "../../components/video/Video";
import "./watch.scss";
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';

// Dữ liệu video giả để test
const MOCK_VIDEOS = [
  { id: 1, userId: 1, userName: "Hieu Thu Dam", userImg: "https://i.pravatar.cc/150?u=a042581f4e29026704d", videoUrl: "https://videos.pexels.com/video-files/4434242/4434242-hd.mp4", desc: "Ca khúc này như cái lồn vậy #Hieuthudam#jack5cu", song: "Đừng Làm Trái Tim Anh Đau - Sơn Tùng M-TP", likes: 123000, comments: 4500, shares: 6700 },
  { id: 2, userId: 2, userName: "Cristiano Ronaldo", userImg: "https://i.pravatar.cc/150?u=a042581f4e29026705d", videoUrl: "https://videos.pexels.com/video-files/853877/853877-hd.mp4", desc: "Amazing goal! SUIIIII! #football #realmadrid", song: "Original Sound", likes: 1200000, comments: 98000, shares: 102000 },
  { id: 3, userId: 3, userName: "Leo Messi", userImg: "https://i.pravatar.cc/150?u=a042581f4e29026706d", videoUrl: "https://videos.pexels.com/video-files/5993807/5993807-hd.mp4", desc: "Family time is the best time.", song: "A-O-K - Tai Verdes", likes: 989000, comments: 2000, shares: 989 }
];

const Watch = () => {
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const containerRef = useRef(null);

  // Hàm xử lý việc cuộn bằng nút bấm
  const handleScroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientHeight; // Cuộn một khoảng bằng chiều cao của khung nhìn
      if (direction === "up") {
        containerRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
      } else {
        containerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="watch-page">
      <div className="videos-container" ref={containerRef}>
        {videos.map((video) => (
          <Video key={video.id} video={video} />
        ))}
      </div>
      {/* --- CÁC NÚT ĐIỀU HƯỚNG LÊN/XUỐNG --- */}
      <div className="scroll-navigation">
        <button className="scroll-btn" onClick={() => handleScroll('up')}>
          <ArrowUpwardOutlinedIcon />
        </button>
        <button className="scroll-btn" onClick={() => handleScroll('down')}>
          <ArrowDownwardOutlinedIcon />
        </button>
      </div>
    </div>
  );
};

export default Watch;
