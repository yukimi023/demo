import { useRef, useState } from 'react';
import './Demo3.scss';

const Demo3 = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
          <h2 className="info-title">Interactive Deformation Modeling Framework</h2>
          <p className="info-description">
            <span style={{ display: 'block', marginBottom: '10px' }}>
              <span style={{ color: '#6a9ec0', fontWeight: 'bold', fontSize: '1.1em' }}>Introduction of BiomPINN:</span> We propose <strong>BiomPINN</strong>, a neural network that incorporates <strong>FE models as constraints</strong>, ensuring the predicted deformations adhere to physical laws and exhibit <strong>biomechanical plausibility</strong>.
            </span>
            
            <span style={{ display: 'block', marginBottom: '10px', marginTop: '15px' }}>
              <span style={{ color: '#6a9ec0', fontWeight: 'bold', fontSize: '1.1em' }}>BiomPINN-PBMs Integration:</span> We introduce a novel integration method that combines <strong>BiomPINN</strong> with <strong>PBMs</strong>, achieving <strong>FE-level accuracy</strong> in deformation modeling while significantly reducing computational time.
            </span>
            
            <span style={{ display: 'block', marginTop: '15px' }}>
              <span style={{ color: '#6a9ec0', fontWeight: 'bold', fontSize: '1.1em' }}>Interactive Deformation Modeling System:</span> We design an <strong>interactive deformation modeling framework</strong> for complex surgical scenario. This offers surgeons the opportunity to <strong>participate in the modeling process</strong> by providing prompts. They can <strong>annotate the local mismatch areas</strong> in AR space, and our framework will propagate such local reliable information to the global volumetric model.
            </span>
          </p>
        </div>
      </div>

      <div className="video-section">
        <video
          ref={videoRef}
          onClick={toggleVideo}
          controls
          crossOrigin="anonymous"
        >
          <source src="Videos/hv.mp4" type="video/mp4" />
          {/* <track 
            kind="subtitles" 
            src="Videos/hv.vtt" 
            srcLang="en" 
            label="English" 
            default 
          /> */}
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default Demo3;
