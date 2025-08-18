import { FC } from 'react';
import './HomePage.scss';

interface DemoItem {
  id: number;
  title: string;
  subtitle: string;
  image?: string;
  color?: string;
}

interface DemoColumn {
  title: string;
  demos: DemoItem[];
}

interface HomePageProps {
  demoColumns: DemoColumn[];
  onSelectDemo: (demoId: number) => void;
}

const HomePage: FC<HomePageProps> = ({ demoColumns, onSelectDemo }) => {
  return (
    <div className="home-page">      
      <div className="demo-grid">
        {demoColumns.map((column, columnIndex) => (
          <div key={columnIndex} className="demo-column">
            <div className="column-header">
              <h2 className="column-title">{column.title}</h2>
            </div>
            <div className="column-content">
              {column.demos.map((demo) => (
                <div 
                  key={demo.id} 
                  className={`demo-card ${demo.id === 5 ? 'demo-card-id5' : ''} ${demo.id === 1 ? 'demo-card-landmark' : ''}`}
                  data-demo-id={demo.id}
                  onClick={() => onSelectDemo(demo.id)}
                >
                  <div className="demo-number">{demo.id}</div>
                  {demo.image ? (
                    <div className="demo-image">
                      <img 
                        src={demo.image} 
                        alt={demo.title} 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && demo.color) {
                            parent.style.backgroundColor = demo.color;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div 
                      className="demo-image color-block" 
                      style={{ backgroundColor: demo.color || '#3A528A' }}
                    >
                      <div className="demo-icon">{demo.id}</div>
                    </div>
                  )}
                  <div className="demo-info">
                    <h2>{demo.title}</h2>
                    <p dangerouslySetInnerHTML={{
                      __html: demo.subtitle.replace(
                        /^Publication:\n/,
                        '<span class="publication-label">Publication:</span> '
                      )
                    }}></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage; 