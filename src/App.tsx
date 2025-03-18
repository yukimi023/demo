import { useState } from 'react';
import Demo1 from './Demos/Demo1';
import Demo2 from './Demos/Demo2';
import './index.scss';

const App = () => {
    const [currentDemo, setCurrentDemo] = useState(0);
    const demos = [
        { id: 1, component: <Demo1 /> },
        { id: 2, component: <Demo2 /> },
        // 注释掉 Demo3 和 Demo4
        // { id: 3, component: <Demo3 /> },
        // { id: 4, component: <Demo4 /> }
    ];
    const CurrentDemo = demos[currentDemo].component;

    const handlePrevious = () => {
        setCurrentDemo((prev) => (prev > 0 ? prev - 1 : demos.length - 1));
    };

    const handleNext = () => {
        setCurrentDemo((prev) => (prev < demos.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="app">
            <header className="header">
                <img className="left-logo" src="./Images/cu_logo.png" alt="Left Logo" />
                <span>Medical Research Platform</span>
                <img className="right-logo" src="./Images/imixr_logo.png" alt="Right Logo" />
            </header>

            <div className="carousel-container">
                <div className="left-section">
                    <div className="nav-button-wrapper" onClick={handlePrevious}>
                        <img src="./Images/to-left.png" alt="Previous" />
                    </div>
                </div>

                <div className="center-section">
                    <div className="demo-card">
                        {CurrentDemo}
                    </div>
                </div>

                <div className="right-section">
                    <div className="nav-button-wrapper" onClick={handleNext}>
                        <img src="./Images/to-right.png" alt="Next" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;