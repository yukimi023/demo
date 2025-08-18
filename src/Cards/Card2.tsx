import { FC } from 'react';
import './Card.scss';

const Card2: FC = () => {
  return (
    <div className="fullscreen-card">
      <div className="card-container card-gradient-2" style={{ backgroundColor: '#c6e1b5' }}>
        <div className="card-number">2</div>
        <div className="card-image landmark-image">
          <img 
            src="./Images/landmark.png" 
            alt="Liver Landmark Detection from Laparoscopic Intraoperative Data"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('color-block');
                parent.innerHTML = '<div class="card-icon">2</div>';
                // parent.style.backgroundColor = '#c6e1b5';
              }
            }}
          />
        </div>
        <div className="card-info">
          <div className="category-title">2D-3D Intraoperative Guidance</div>
          <h1>Liver Landmark Detection from Laparoscopic Intraoperative Videos</h1>
          <p dangerouslySetInnerHTML={{
            __html: `<span class="publication-label">Publication:</span> Depth-Driven Geometric Prompt Learning for Laparoscopic Liver Landmark Detection, MICCAI 2024, Finalist.\n\n`
          }}></p>
        </div>
      </div>
    </div>
  );
};

export default Card2; 