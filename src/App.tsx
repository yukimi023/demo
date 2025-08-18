import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Demo1 from './Demos/Demo1';
import Demo2 from './Demos/Demo2';
import Demo3 from './Demos/Demo3';
import Demo4 from './Demos/Demo4';
import HomePage from './components/HomePage';
import Card1 from './Cards/Card1';
import Card2 from './Cards/Card2';
import Card3 from './Cards/Card3';
import Card4 from './Cards/Card4';
import Card5 from './Cards/Card5';
import Card6 from './Cards/Card6';
import CardV1 from './Cards/CardV1';
import CardV2 from './Cards/CardV2';
import CardV3 from './Cards/CardV3';
import './index.scss';

const App = () => {
    const [currentDemo, setCurrentDemo] = useState<number | null>(null);
    
    const demoColumns = [
        {
            title: "2D-3D Liver Fusion",
            demos: [
                { 
                    id: 1, 
                    component: <Demo4 />, 
                    title: "Liver Landmark Detection from Laparoscopic Intraoperative Data", 
                    subtitle: "Publication:\nDepth-Driven Geometric Prompt Learning for Laparoscopic Liver Landmark Detection, MICCAI 2024, Finalist.",
                    image: "./Images/landmark.png",
                    color: "#85459C"
                },
                { 
                    id: 2, 
                    component: <Demo2 />, 
                    title: "Preoperative-to-Intraoperative Liver Registration", 
                    subtitle: "Publication:\nLandmark-Free Preoperative-to-Intraoperative Registration in Laparoscopic Liver Resection, IEEE Transactions on Medical Imaging, 2025.",
                    image: "./Images/registration.png",
                    color: "#85459C"
                },
            ]
        },
        {
            title: "Video Assisted Analysis",
            demos: [
                { 
                    id: 3, 
                    component: <Demo1 />, 
                    title: "Surgical Workflow Recognition in Laparoscopic Liver Resection with Pringle Maneuver",
                    subtitle: "Publication:\nSurgical Workflow Recognition and Blocking Effectiveness Detection in Laparoscopic Liver Resections with Pringle Maneuver, AAAI 2025.",
                    image: "./Images/demo1_thumbnail.jpg",
                    color: "#3A528A"
                },
                { 
                    id: 4, 
                    component: <Demo1 />, 
                    title: "Bleeding Region and Point Monitoring in Laparoscopic Surgery",
                    subtitle: "Publication:\nSynergistic Bleeding Region and Point Detection in Laparoscopic Surgical Videos, 2025, Under review.",
                    image: "./Images/bleeding.png",
                    color: "#3A528A"
                },
                { 
                    id: 5, 
                    component: <Demo1 />, 
                    title: "Real-time Instrument Tracking in Laparoscopic Surgery",
                    subtitle: "Publication:\nSynergistic Bleeding Region and Point Detection in Laparoscopic Surgical Videos, 2025, Under review.",
                    image: "./Images/instrument.png",
                    color: "#3A528A"
                }
            ]
        },
        {
            title: "Soft-Tissue Deformation",
            demos: [
                { 
                    id: 6, 
                    component: <Demo3 />, 
                    title: "Interactive Deformation Modeling for AR-Guided Surgical Navigation", 
                    subtitle: "Publication:\nTowards Reliable AR-Guided Surgical Navigation: Interactive Deformation Modeling with Data-Driven Biomechanics and Prompts, IEEE Transactions on Medical Imaging, 2025.",
                    image: "./Images/deformation.png",
                    color: "#2E7D9E"
                }
            ]
        }
    ];
    
    // 扁平化所有demos用于查找
    const allDemos = demoColumns.flatMap(column => column.demos);

    const handleSelectDemo = (demoId: number) => {
        const index = allDemos.findIndex(demo => demo.id === demoId);
        setCurrentDemo(index);
    };

    const handleBackToMenu = () => {
        setCurrentDemo(null);
    };

    const handlePrevious = () => {
        if (currentDemo !== null) {
            setCurrentDemo((prev) => {
                return prev! > 0 ? prev! - 1 : allDemos.length - 1;
            });
        }
    };

    const handleNext = () => {
        if (currentDemo !== null) {
            setCurrentDemo((prev) => {
                return prev! < allDemos.length - 1 ? prev! + 1 : 0;
            });
        }
    };

    return (
        <Routes>
            {/* 卡片路由 */}
            <Route path="/card1" element={<Card1 />} />
            <Route path="/card2" element={<Card2 />} />
            <Route path="/card3" element={<Card3 />} />
            <Route path="/card4" element={<Card4 />} />
            <Route path="/card5" element={<Card5 />} />
            <Route path="/card6" element={<Card6 />} />
            <Route path="/cardv1" element={<CardV1 />} />
            <Route path="/cardv2" element={<CardV2 />} />
            <Route path="/cardv3" element={<CardV3 />} />
            
            {/* 主应用路由 */}
            <Route path="/*" element={
                <>
                    {/* 显示首页或选中的演示 */}
                    {currentDemo === null ? (
                        <div className="app">
                            <header className="header">
                                <img className="left-logo" src="./Images/cu_logo.png" alt="Left Logo" />
                                {/* <img className="nfyy-logo" src="./Images/nfyy_logo.png" alt="NFYY Logo" /> */}
                                <span>The Demo Library for IAS Program</span>
                                <img className="right-logo" src="./Images/imixr_logo.png" alt="Right Logo" />
                            </header>
                            
                            <HomePage demoColumns={demoColumns} onSelectDemo={handleSelectDemo} />
                        </div>
                    ) : (
                        <div className="app">
                            <header className="header">
                                <img className="left-logo" src="./Images/cu_logo.png" alt="Left Logo" />
                                {/* <img className="nfyy-logo" src="./Images/nfyy_logo.png" alt="NFYY Logo" /> */}
                                <span>IAS Project Demos</span>
                                <img className="right-logo" src="./Images/imixr_logo.png" alt="Right Logo" />
                            </header>
                            
                            <div className="demo-title-container">
                                <div className="back-button" onClick={handleBackToMenu}>
                                    <div className="back-icon"></div>
                                </div>
                                <h1 className="demo-main-title">{currentDemo !== null ? allDemos[currentDemo].title : ''}</h1>
                            </div>

                            <div className="carousel-container">
                                <div className="left-section">
                                    <div className="nav-button-wrapper" onClick={handlePrevious}>
                                        <img src="./Images/to-left.png" alt="Previous" />
                                    </div>
                                </div>

                                <div className="center-section">
                                    <div className="demo-card">
                                        {currentDemo !== null ? allDemos[currentDemo].component : null}
                                    </div>
                                </div>

                                <div className="right-section">
                                    <div className="nav-button-wrapper" onClick={handleNext}>
                                        <img src="./Images/to-right.png" alt="Next" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            } />
        </Routes>
    );
};

export default App;