import { FC } from 'react';
import './Card.scss';

const CardV2: FC = () => {
  return (
    <div className="fullscreen-card">
      <div className="card-container card-gradient-new2" style={{ backgroundColor: '#fff3cc' }}>
        <div className="card-number">2</div>
        <div className="card-image card-v2-image">
          <img 
            src="./Images/V2_3.jpg" 
            alt="New Card V2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('color-block');
                parent.innerHTML = '<div class="card-icon">2</div>';
              }
            }}
          />
        </div>
        <div className="card-info">
          {/* <div className="category-title">New Card Category V2</div> */}
          <h1>Liver Surgical Planning</h1>
          <p dangerouslySetInnerHTML={{
            __html: `XR-based anatomical liver resection planning platform supports surgeons in making precise preoperative decisions in an immersive environment.`
          }}></p>
        </div>
      </div>
    </div>
  );
};

export default CardV2; 