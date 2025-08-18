import { FC } from 'react';
import './Card.scss';

const CardV1: FC = () => {
  return (
    <div className="fullscreen-card">
      <div className="card-container card-gradient-new1" style={{ backgroundColor: '#c5e1b5' }}>
        <div className="card-number">1</div>
        <div className="card-image card-v1-image">
          <img 
            src="./Images/V1.png" 
            alt="New Card V1"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('color-block');
                parent.innerHTML = '<div class="card-icon">1</div>';
              }
            }}
          />
        </div>
        <div className="card-info">
          {/* <div className="category-title">New Card Category V1</div> */}
          <h1>Medical Volume Visualization</h1>
          <p dangerouslySetInnerHTML={{
            __html: `We design an approach based on the latest neural rendering techniques and provides surgeons with direct observation of medical scans. \n\n`
          }}></p>
        </div>
      </div>
    </div>
  );
};

export default CardV1; 