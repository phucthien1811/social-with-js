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
  const { ref, inView } = useInView({ threshold: 0.5 });

  useEffect(() => { setIsPlaying(inView); }, [inView]);

  const handleVideoClick = () => { setIsPlaying(!isPlaying); };
  
  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  return (
    <div className="video-item" ref={ref}>
      <div className="video-main-content">
        <div className="user-header">
          <Link to={`/profile/${video.userId}`} className="user-info">
            <img src={video.userImg} alt="" className="user-avatar" />
            <div className="name-and-desc">
                <span className="user-name">{video.userName}</span>
                <p className="video-desc">{video.desc}</p>
            </div>
          </Link>
        </div>
        <div className="video-wrapper" onClick={handleVideoClick}>
          <ReactPlayer
            url={video.videoUrl}
            playing={isPlaying}
            loop={true}
            width="100%"
            height="100%"
            muted={false}
          />
        </div>
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
  );
};

export default Video;
