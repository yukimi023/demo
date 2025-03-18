import { useRef, useState } from 'react';
import './Demo1.scss';

const phaseStamps = [
  { start: "00:00", end: "06:18", text: "Preparing" },
  { start: "06:18", end: "06:58", text: "Knotting" },
  { start: "06:58", end: "13:09", text: "Resecting" },
  { start: "13:09", end: "13:22", text: "Knotting" },
  { start: "13:22", end: "35:02", text: "Resecting" },
  { start: "35:02", end: "35:20", text: "Releasing" },
  { start: "35:20", end: "99:99", text: "Postprocessing" }
];

const effectivenessStamps = [
  { start: "00:00", end: "07:13", text: "Ineffective" },
  { start: "07:13", end: "99:99", text: "Effective" },
];

const timeToSeconds = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
};

const Demo1 = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');
  const [currentEffectiveness, setCurrentEffectiveness] = useState('');

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const phase = phaseStamps.find(stamp =>
        currentTime >= timeToSeconds(stamp.start) &&
        currentTime < timeToSeconds(stamp.end)
      );
      const effectiveness = effectivenessStamps.find(stamp =>
        currentTime >= timeToSeconds(stamp.start) &&
        currentTime < timeToSeconds(stamp.end)
      );
      setCurrentPhase(phase?.text || '');
      setCurrentEffectiveness(effectiveness?.text || '');
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="demo1-container">
      <div className="info-section">
        <div className="info-header">
          <h2 className="info-title">Laparoscopic Liver Resections with Pringle Maneuver</h2>
          <p className="info-description">
            This online system integrates two complementary AI-assisted surgical monitoring tasks: real-time <span className="phase-text-color"><strong>workflow recognition</strong></span> and <span className="effectiveness-text-color"><strong>blocking effectiveness detection</strong></span> in laparoscopic liver resections. It monitors the surgical procedure and provides timely warnings for ineffective or prolonged blocking.
          </p>
        </div>
        <div className="status-display">
          <div className="phase-text">
            <span>Phase</span>
            <span style={{ fontSize: '1.5em' }}>{currentPhase}</span>
          </div>
          <div className="effectiveness-text">
            <span>Effectiveness</span>
            <span 
              style={{ 
                fontSize: '1.5em',
                color: currentEffectiveness === 'Effective' ? '#90EE90' : '#FF7F7F'
              }}
            >
              {currentEffectiveness}
            </span>
          </div>
        </div>
      </div>
      
      <div className="video-section">
        <video
          ref={videoRef}
          onClick={toggleVideo}
          onTimeUpdate={handleTimeUpdate}
          controls
        >
          <source src="/Videos/dv.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default Demo1;
