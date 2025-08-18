import { FC } from 'react';
import './Card.scss';

const CardV3: FC = () => {
  return (
    <div className="fullscreen-card">
      <div className="card-container card-gradient-new3" style={{ backgroundColor: '#bdd7ee' }}>
        <div className="card-number">3</div>
        <div className="card-image card-v3-image">
          <img 
            src="./Images/V3_2.jpeg" 
            alt="New Card V3"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('color-block');
                parent.innerHTML = '<div class="card-icon">3</div>';
              }
            }}
          />
        </div>
        <div className="card-info">
          {/* <div className="category-title">New Card Category V3</div> */}
          <h1>Naked-eye 3D display</h1>
          <p dangerouslySetInnerHTML={{
            __html: `The coordinated naked-eye 3D display system, including a stereo panel and a standing screen, enables effective doctor-patient communication.`
          }}></p>
        </div>
      </div>
    </div>
  );
};

export default CardV3; 