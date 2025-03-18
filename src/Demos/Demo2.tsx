import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './Demo2.scss';

const Demo2 = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);
  const [currentModel, setCurrentModel] = useState<THREE.Object3D | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState<{ori: boolean, demo: boolean}>({ori: false, demo: false});
  const [showModel, setShowModel] = useState(false);
  const [showVessels, setShowVessels] = useState(true);
  const [vesselModel, setVesselModel] = useState<THREE.Object3D | null>(null);
  
  const oriVideoRef = useRef<HTMLVideoElement>(null);
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 初始化 Three.js
  useEffect(() => {
    if (!canvasRef.current || !showModel) {
      return;
    }

    // 创建场景
    const newScene = new THREE.Scene();
    // 设置浅蓝紫灰色背景
    newScene.background = new THREE.Color(0x2a2d3e);

    // 创建相机
    const newCamera = new THREE.PerspectiveCamera(
      45,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight || 1,
      0.1,
      1000
    );
    newCamera.position.set(2, 2, 5);
    newCamera.lookAt(0, 0, 0);

    // 创建渲染器
    const newRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false // 关闭alpha以确保背景色显示
    });
    newRenderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    canvasRef.current.appendChild(newRenderer.domElement);

    // 创建控制器
    const newControls = new OrbitControls(newCamera, newRenderer.domElement);
    newControls.enableDamping = true;
    newControls.dampingFactor = 0.25;
    newControls.enableZoom = true;

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    newScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(3, 3, 3);
    newScene.add(directionalLight);

    // 设置状态
    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
    setControls(newControls);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      if (newControls) {
        newControls.update();
      }
      newRenderer.render(newScene, newCamera);
    };
    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      newCamera.aspect = width / height;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (canvasRef.current && newRenderer.domElement) {
        canvasRef.current.removeChild(newRenderer.domElement);
      }
      
      newRenderer.dispose();
    };
  }, [showModel]);

  // 加载模型
  const loadModel = () => {
    if (!scene) {
      console.error('场景未初始化');
      return;
    }

    // 清理现有模型
    if (currentModel) {
      scene.remove(currentModel);
    }

    setIsLoading(true);

    // 创建一个组来存放所有模型
    const modelGroup = new THREE.Group();
    
    // 添加到场景中
    scene.add(modelGroup);
    setCurrentModel(modelGroup);
    
    // 加载肝脏模型
    const loader = new GLTFLoader();
    loader.load(
      '/Models/liver.glb',
      (gltf) => {
        console.log('肝脏模型加载成功');
        const liverModel = gltf.scene;
        
        // 设置肝脏材质为不透明
        liverModel.traverse(child => {
          if (child instanceof THREE.Mesh) {
            // 保留原始材质和贴图
            const originalMaterial = child.material;
            
            // 如果是数组材质，处理每个材质
            if (Array.isArray(originalMaterial)) {
              originalMaterial.forEach(mat => {
                mat.transparent = true;  // 启用透明
                mat.opacity = 0.85;      // 轻微透明
                mat.needsUpdate = true;
              });
            } else {
              // 单个材质的情况
              originalMaterial.transparent = true;  // 启用透明
              originalMaterial.opacity = 0.7;      // 轻微透明
              originalMaterial.needsUpdate = true;
            }
          }
        });
        
        modelGroup.add(liverModel);
        
        // 加载血管模型
        loader.load(
          '/Models/vessels.glb',
          (gltf) => {
            console.log('血管模型加载成功');
            const vesselsModel = gltf.scene;
            
            // 设置血管材质
            vesselsModel.traverse(child => {
              if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xcc0000,
                  transparent: false,
                  roughness: 0.3,
                  metalness: 0.7
                });
              }
            });
            
            // 保存血管模型引用以便切换显示
            setVesselModel(vesselsModel);
            vesselsModel.visible = showVessels;
            modelGroup.add(vesselsModel);
            
            // 计算整个模型组的包围盒
            const box = new THREE.Box3().setFromObject(modelGroup);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            // 调整缩放比例
            const scale = 2.0 / Math.max(size.x, size.y, size.z);
            modelGroup.scale.setScalar(scale);
            
            // 将模型居中
            modelGroup.position.copy(center).multiplyScalar(-scale);
            
            // 调整相机位置
            if (camera && controls) {
              camera.position.set(3, 3, 3);
              controls.target.set(0, 0, 0);
              controls.update();
            }
            
            setIsLoading(false);
          },
          undefined,
          (error) => {
            console.error('血管模型加载失败:', error);
            
            // 即使血管加载失败也显示肝脏
            const box = new THREE.Box3().setFromObject(modelGroup);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            const scale = 2.0 / Math.max(size.x, size.y, size.z);
            modelGroup.scale.setScalar(scale);
            modelGroup.position.copy(center).multiplyScalar(-scale);
            
            setIsLoading(false);
          }
        );
      },
      undefined,
      (error) => {
        console.error('肝脏模型加载失败:', error);
        setIsLoading(false);
      }
    );
  };

  // 处理导入按钮点击
  const handleImport = () => {
    setShowModel(true);
    // 不要立即检查scene，而是等待Three.js初始化完成
  };

  // 监听scene变化，当scene创建后再加载模型
  useEffect(() => {
    if (scene && showModel) {
      console.log('开始加载模型，场景状态:', {
        sceneChildren: scene.children.length,
        renderer: !!renderer,
        camera: !!camera
      });
      loadModel();
    }
  }, [scene, showModel]); // 增加依赖项

  // 处理视频错误
  const handleVideoError = (type: 'ori' | 'demo') => {
    setVideoError(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const syncVideos = (sourceVideo: HTMLVideoElement, targetVideo: HTMLVideoElement) => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    // 同步播放状态
    if (sourceVideo.paused !== targetVideo.paused) {
      if (sourceVideo.paused) {
        targetVideo.pause();
      } else {
        targetVideo.play();
      }
    }
    
    // 同步播放时间
    if (Math.abs(sourceVideo.currentTime - targetVideo.currentTime) > 0.1) {
      targetVideo.currentTime = sourceVideo.currentTime;
    }
    
    setIsSyncing(false);
  };

  // 添加切换控制
  useEffect(() => {
    if (vesselModel) {
      vesselModel.visible = showVessels;
    }
  }, [showVessels, vesselModel]);

  useEffect(() => {
    if (scene && camera) {
      controls!.target.set(0, 0, 0);
    }
  }, [scene, camera, controls]);

  return (
    <div className="demo2-container">
      <div className="left-text-section">
        <div className="info-header">
          <h2 className="info-title">Preoperative-to-Intraoperative (3D/2D) Liver Registration</h2>
          <p className="info-description">
            This technique dynamically aligns preoperative CT-derived 3D liver models with intraoperative laparoscopic images to address deformations caused by surgical manipulation and positional shifts. It extracts anatomical landmarks from laparoscopic views and correlates them with CT structures using deformable registration algorithms and deep learning-based feature matching. Challenges include limited laparoscopic field-of-view, real-time organ motion, and variable lighting. By compensating for soft-tissue deformations, it enhances intraoperative navigation accuracy, supports precise tumor boundary identification, and minimizes risks to critical vascular structures during resection.
          </p>
        </div>
      </div>

      <div className="middle-section">
        <div className="section-title">Preoperative CT Image</div>
        <div className="image-container">
          <img src="/Images/Demo2/CT2.png" alt="CT扫描图" />
        </div>
        
        <div className="arrow-container">
          <img src="/Images/arrow1.png" alt="Process flow" />
        </div>
        
        {!showModel ? (
          <div className="import-button-container">
            <button className="import-button" onClick={handleImport}>
              Import Model
            </button>
          </div>
        ) : (
          <>
            <div className="section-title model-title">
              3D Liver Model
            </div>
            <div className="model-container" ref={canvasRef}>
              {isLoading && <div className="loading">正在加载模型...</div>}
              
              <div className="vessel-toggle">
                <span className="vessel-toggle-label">Show Vessels</span>
                <label className="vessel-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={showVessels}
                    onChange={(e) => setShowVessels(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="middle-to-right">
        <img src="/Images/arrow1.png" alt="Process flow" />
      </div>

      <div className="right-section">
        <div className="video-section top">
          <div className="section-title">Input Video</div>
          <div className="video-container">
            <video 
              ref={oriVideoRef}
              controls 
              autoPlay 
              loop 
              muted 
              onError={() => handleVideoError('ori')}
              onPlay={() => {
                if (demoVideoRef.current) {
                  syncVideos(oriVideoRef.current!, demoVideoRef.current);
                }
              }}
              onPause={() => {
                if (demoVideoRef.current) {
                  syncVideos(oriVideoRef.current!, demoVideoRef.current);
                }
              }}
              onSeeked={() => {
                if (demoVideoRef.current) {
                  syncVideos(oriVideoRef.current!, demoVideoRef.current);
                }
              }}
            >
              <source src="/Videos/Demo2/ori1.mp4" type="video/mp4" />
              您的浏览器不支持视频标签
            </video>
            {videoError.ori && <div className="error-message">视频加载失败，请检查路径</div>}
          </div>
        </div>
        
        <div className="arrow-container">
          <img src="/Images/arrow1.png" alt="Process flow" />
        </div>
        
        <div className="video-section bottom">
          <div className="section-title">3D-2D Registration</div>
          <div className="video-container">
            <video 
              ref={demoVideoRef}
              controls 
              autoPlay 
              loop 
              muted 
              onError={() => handleVideoError('demo')}
              onPlay={() => {
                if (oriVideoRef.current) {
                  syncVideos(demoVideoRef.current!, oriVideoRef.current);
                }
              }}
              onPause={() => {
                if (oriVideoRef.current) {
                  syncVideos(demoVideoRef.current!, oriVideoRef.current);
                }
              }}
              onSeeked={() => {
                if (oriVideoRef.current) {
                  syncVideos(demoVideoRef.current!, oriVideoRef.current);
                }
              }}
            >
              <source src="/Videos/Demo2/demo1.mp4" type="video/mp4" />
              您的浏览器不支持视频标签
            </video>
            {videoError.demo && <div className="error-message">视频加载失败，请检查路径</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo2;
