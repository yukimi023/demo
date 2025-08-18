import { FC } from 'react';
import './Card.scss';

const Card3: FC = () => {
  return (
    <div className="fullscreen-card">
      <div className="card-container card-gradient-3" style={{ backgroundColor: '#fff3cc' }}>
        <div className="card-number">3</div>
        <div className="card-image">
          <img 
            src="./Images/registration.png" 
            alt="Preoperative-to-Intraoperative Liver Registration"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('color-block');
                parent.innerHTML = '<div class="card-icon">3</div>';
                // parent.style.backgroundColor = '#fff3cc';
              }
            }}
          />
        </div>
        <div className="card-info">
          <div className="category-title">2D-3D Liver Fusion</div>
          <h1>Preoperative-to-Intraoperative Liver Registration</h1>
          <p dangerouslySetInnerHTML={{
            __html: `<span class="publication-label">Publication:</span> Landmark-Free Preoperative-to-Intraoperative Registration in Laparoscopic Liver Resection, IEEE Transactions on Medical Imaging, 2025.`
          }}></p>
        </div>
      </div>
    </div>
  );
};

export default Card3; 