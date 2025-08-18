import { FC } from 'react';
import './Card.scss';

const Card1: FC = () => {
  return (
    <div className="fullscreen-card">
      <div className="card-container card-gradient-1" style={{ backgroundColor: '#bdd7ef' }}>
        <div className="card-number">1</div>
        <div className="card-image">
          <img 
            src="./Images/demo1_thumbnail.jpg" 
            alt="Surgical Workflow Recognition in Laparoscopic Liver Resection with Pringle Maneuver"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('color-block');
                parent.innerHTML = '<div class="card-icon">1</div>';
                // parent.style.backgroundColor = '#bdd7ef';
              }
            }}
          />
        </div>
        <div className="card-info">
          <div className="category-title">Whole Surgical Workflow Analysis</div>
          <h1>Surgical Workflow Recognition in Laparoscopic Liver Resection with Pringle Maneuver</h1>
          <p dangerouslySetInnerHTML={{
            __html: `<span class="publication-label">Publication:</span> Surgical Workflow Recognition and Blocking Effectiveness Detection in Laparoscopic Liver Resections with Pringle Maneuver, AAAI 2025.`
          }}></p>
        </div>
      </div>
    </div>
  );
};

export default Card1; 