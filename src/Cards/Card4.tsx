import { FC } from 'react';
import './Card.scss';

const Card4: FC = () => {
  return (
    <div className="fullscreen-card">
      <div className="card-container card-gradient-4" style={{ backgroundColor: '#ffe698' }}>
        <div className="card-number">4</div>
        <div className="card-image">
          <img 
            src="./Images/deformation.png" 
            alt="Interactive Deformation Modeling for AR-Guided Surgical Navigation"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('color-block');
                parent.innerHTML = '<div class="card-icon">4</div>';
                // parent.style.backgroundColor = '#ffe698';
              }
            }}
          />
        </div>
        <div className="card-info">
          <div className="category-title">2D-3D Liver Deformation</div>
          <h1>Interactive Deformation Modeling for AR-Guided Surgical Navigation</h1>
          <p dangerouslySetInnerHTML={{
            __html: `<span class="publication-label">Publication:</span> Towards Reliable AR-Guided Surgical Navigation: Interactive Deformation Modeling with Data-Driven Biomechanics and Prompts, IEEE Transactions on Medical Imaging, 2025.\n\n`
          }}></p>
        </div>
      </div>
    </div>
  );
};

export default Card4; 