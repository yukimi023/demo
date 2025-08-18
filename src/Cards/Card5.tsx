import { FC } from 'react';
import './Card.scss';

const Card5: FC = () => {
  return (
    <div className="fullscreen-card">
      <div className="card-container card-gradient-5" style={{ backgroundColor: '#FBE5D6' }}>
        <div className="card-number">5</div>
        <div className="card-image">
          <img 
            src="./Images/bleeding.png" 
            alt="Bleeding Region and Point Monitoring in Laparoscopic Surgery"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('color-block');
                parent.innerHTML = '<div class="card-icon">5</div>';
                // parent.style.backgroundColor = '#FBE5D6';
              }
            }}
          />
        </div>
        <div className="card-info">
          <div className="category-title">Intraoperative Bleeding Monitoring</div>
          <h1>Bleeding Region and Point Monitoring in Laparoscopic Surgery</h1>
          <p dangerouslySetInnerHTML={{
            __html: `<span class="publication-label">Publication:</span> Synergistic Bleeding Region and Point Detection in Laparoscopic Surgical Videos, 2025, Under review.\n\n`
          }}></p>
        </div>
      </div>
    </div>
  );
};

export default Card5; 