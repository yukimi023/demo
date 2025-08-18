import { useState, useRef } from 'react';
import './Demo4.scss';

const Demo4 = () => {
  const [videoErrors, setVideoErrors] = useState<{[key: string]: boolean}>({
    video1: false,
    video2: false,
    video3: false,
    video4: false
  });

  const videoRefs = {
    video1: useRef<HTMLVideoElement>(null),
    video2: useRef<HTMLVideoElement>(null),
    video3: useRef<HTMLVideoElement>(null),
    video4: useRef<HTMLVideoElement>(null)
  };

  // 处理视频错误
  const handleVideoError = (videoId: string) => {
    setVideoErrors(prev => ({
      ...prev,
      [videoId]: true
    }));
  };

  // 同步所有视频播放
  const syncAllVideos = (sourceVideoId: string, action: 'play' | 'pause' | 'seek', currentTime?: number) => {
    Object.entries(videoRefs).forEach(([id, ref]) => {
      if (id !== sourceVideoId && ref.current) {
        const video = ref.current;
        switch (action) {
          case 'play':
            video.play().catch(e => console.error(`视频 ${id} 播放失败:`, e));
            break;
          case 'pause':
            video.pause();
            break;
          case 'seek':
            if (currentTime !== undefined && Math.abs(video.currentTime - currentTime) > 0.2) {
              video.currentTime = currentTime;
            }
            break;
        }
      }
    });
  };

  return (
    <div className="demo4-container">
      <div className="video-grid">
        {/* 箭头 */}
        <div className="arrow-horizontal">
          <img src="/Images/arrow1.png" alt="Arrow to right" />
        </div>
        <div className="arrow-vertical">
          <img src="/Images/arrow1.png" alt="Arrow to down" />
        </div>
        
        {/* 第一行 */}
        <div className="video-row">
          <div className="video-section">
            <div className="section-title">Surgical Video</div>
            <div className="video-container">
              <video 
                ref={videoRefs.video1}
                controls 
                autoPlay 
                loop 
                muted 
                onError={() => handleVideoError('video1')}
                onPlay={() => syncAllVideos('video1', 'play')}
                onPause={() => syncAllVideos('video1', 'pause')}
                onSeeked={(e) => syncAllVideos('video1', 'seek', e.currentTarget.currentTime)}
              >
                <source src="/Videos/Demo4/surgical_video.mp4" type="video/mp4" />
                您的浏览器不支持视频标签
              </video>
              {videoErrors.video1 && <div className="error-message">视频加载失败，请检查路径</div>}
            </div>
          </div>

          <div className="video-section">
            <div className="section-title">Landmark Detection</div>
            <div className="video-container">
              <video 
                ref={videoRefs.video2}
                controls 
                autoPlay 
                loop 
                muted 
                onError={() => handleVideoError('video2')}
                onPlay={() => syncAllVideos('video2', 'play')}
                onPause={() => syncAllVideos('video2', 'pause')}
                onSeeked={(e) => syncAllVideos('video2', 'seek', e.currentTarget.currentTime)}
              >
                <source src="/Videos/Demo4/landmark_detection.mp4" type="video/mp4" />
                您的浏览器不支持视频标签
              </video>
              {videoErrors.video2 && <div className="error-message">视频加载失败，请检查路径</div>}
            </div>
          </div>
        </div>

        {/* 第二行 */}
        <div className="video-row">
          <div className="video-section">
            <div className="section-title">Reconstructed Point Cloud</div>
            <div className="video-container">
              <video 
                ref={videoRefs.video3}
                controls 
                autoPlay 
                loop 
                muted 
                onError={() => handleVideoError('video3')}
                onPlay={() => syncAllVideos('video3', 'play')}
                onPause={() => syncAllVideos('video3', 'pause')}
                onSeeked={(e) => syncAllVideos('video3', 'seek', e.currentTarget.currentTime)}
              >
                <source src="/Videos/Demo4/point_cloud.mp4" type="video/mp4" />
                您的浏览器不支持视频标签
              </video>
              {videoErrors.video3 && <div className="error-message">视频加载失败，请检查路径</div>}
            </div>
          </div>

          <div className="video-section">
            <div className="section-title">Ground Truth</div>
            <div className="video-container">
              <video 
                ref={videoRefs.video4}
                controls 
                autoPlay 
                loop 
                muted 
                onError={() => handleVideoError('video4')}
                onPlay={() => syncAllVideos('video4', 'play')}
                onPause={() => syncAllVideos('video4', 'pause')}
                onSeeked={(e) => syncAllVideos('video4', 'seek', e.currentTarget.currentTime)}
              >
                <source src="/Videos/Demo4/ground_truth.mp4" type="video/mp4" />
                您的浏览器不支持视频标签
              </video>
              {videoErrors.video4 && <div className="error-message">视频加载失败，请检查路径</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo4;
