import { useRef, useState, useEffect } from "react";
import "./video.scss";
import { Link } from "react-router-dom";
import ReactPlayer from "react-player/lazy";
import { useInView } from "react-intersection-observer";
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const Video = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Dùng hook này để kiểm tra xem video có đang trong tầm nhìn không
  const { ref, inView } = useInView({ threshold: 0.5 });

  // Tự động play/pause khi video vào/ra khỏi tầm nhìn
  useEffect(() => {
    setIsPlaying(inView);
  }, [inView]);

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Hàm để định dạng các con số lớn
  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  return (
    <div className="video-item" ref={ref}>
      <div className="video-player-container" onClick={handleVideoClick}>
        <ReactPlayer
          url={video.videoUrl}
          playing={isPlaying}
          loop={true}
          width="100%"
          height="100%"
          muted={false}
          playsinline={true}
        />
      </div>

      <div className="video-overlay">
        <div className="video-text-info">
          <Link to={`/profile/${video.userId}`} className="user-info">
            <img src={video.userImg} alt="" className="user-avatar" />
            <span className="user-name">{video.userName}</span>
          </Link>
          <p className="video-desc">{video.desc}</p>
          <div className="song-info">
            <MusicNoteIcon />
            <span>{video.song}</span>
          </div>
        </div>

        <div className="video-actions">
          <div className="action-button">
            <FavoriteIcon />
            <span>{formatCount(video.likes)}</span>
          </div>
          <div className="action-button">
            <CommentIcon />
            <span>{formatCount(video.comments)}</span>
          </div>
          <div className="action-button">
            <ShareIcon />
            <span>{formatCount(video.shares)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;
