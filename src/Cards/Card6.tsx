import { FC } from 'react';
import './Card.scss';

const Card6: FC = () => {
  return (
    <div className="fullscreen-card">
      <div className="card-container card-gradient-6" style={{ backgroundColor: '#E7E6E6' }}>
        <div className="card-number">6</div>
        <div className="card-image">
          <img 
            src="./Images/instrument.png" 
            alt="Real-time Instrument Tracking in Laparoscopic Surgery"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('color-block');
                parent.innerHTML = '<div class="card-icon">6</div>';
                // parent.style.backgroundColor = '#E7E6E6';
              }
            }}
          />
        </div>
        <div className="card-info card-info-id5">
          <div className="category-title">Operation Assisted Recognition</div>
          <h1>Real-time Instrument Tracking in Laparoscopic Liver Surgery</h1>
          {<p dangerouslySetInnerHTML={{
            __html: `<span class="publication-label"></span> \n`
          }}></p> }
        </div>
      </div>
    </div>
  );
};

export default Card6; 