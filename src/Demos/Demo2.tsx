import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './Demo2.scss';

// --- Define an interface for the mapping data ---
interface MappingEntry {
    vertex_index: number;
    '3d_coordinates': [number, number, number];
    '2d_coordinates': [number, number];
}
// ---------------------------------------------

// --- 1. 修改视频帧率常量 ---
const VIDEO_FPS = 63; // 从 7 修改为 63
// -------------------------------------------------

const Demo2 = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);
  const [currentModel, setCurrentModel] = useState<THREE.Object3D | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState<{ori: boolean, demo: boolean}>({ori: false, demo: false});
  
  const oriVideoRef = useRef<HTMLVideoElement>(null);
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [overlayCtx, setOverlayCtx] = useState<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- 1. 修改 State 和 Ref 类型 ---
  const [mappingData, setMappingData] = useState<MappingEntry[] | null>(null); // 存储数组
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- 2. 添加当前帧状态 ---
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0); // Start at frame 0
  const [targetFrameIndex, setTargetFrameIndex] = useState<number>(0); // Target frame based on video time
  // -------------------------

  // --- 1. Add state for correspondence visibility ---
  const [showCorrespondence, setShowCorrespondence] = useState(true);
  // -------------------------------------------------

  // Refs for accessing latest state in animate
  const currentModelRef = useRef<THREE.Object3D | null>(null);
  const overlayCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const demoVideoRefRef = useRef<HTMLVideoElement | null>(null);
  const mappingDataRef = useRef<MappingEntry[] | null>(null); // Ref 也存储数组
  // --- 1. Add ref for correspondence visibility ---
  const showCorrespondenceRef = useRef(true);
  // ---------------------------------------------

  // Sync state to Refs
  useEffect(() => { currentModelRef.current = currentModel; }, [currentModel]);
  useEffect(() => { overlayCtxRef.current = overlayCtx; }, [overlayCtx]);
  useEffect(() => { cameraRef.current = camera; }, [camera]);
  useEffect(() => { rendererRef.current = renderer; }, [renderer]);
  useEffect(() => { demoVideoRefRef.current = demoVideoRef.current; }, [demoVideoRef.current]);
  useEffect(() => { mappingDataRef.current = mappingData; }, [mappingData]); // 同步数组
  // --- 1. Sync visibility state to ref ---
  useEffect(() => { showCorrespondenceRef.current = showCorrespondence; }, [showCorrespondence]);
  // --------------------------------------

  // --- 4. 重构数据加载逻辑 ---
  const fetchFrameData = async (frameIndex: number) => {
    if (isFetchingData) return;

    setIsFetchingData(true);
    // setFetchError(null); // <--- 不再在这里清除错误

    const formattedIndex = frameIndex.toString().padStart(4, '0');
    const url = `/Data/Demo2/frame_${formattedIndex}.json`;
    // --- 移除 Fetching 日志 ---
    // console.log(`Fetching data for frame: ${formattedIndex} from ${url}`);
    // -------------------------

    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
            // --- 移除 404 警告日志 ---
            // console.warn(`Mapping data not found for frame ${formattedIndex} (404). Keeping previous data.`);
            // -----------------------
            // 遇到 404 不设置错误，也不清除之前的错误
        } else {
            // 处理其他 HTTP 错误 (非 404)
            const errorMsg = `HTTP error! status: ${response.status}`;
            console.error(`Fetch error for frame ${formattedIndex}: ${errorMsg}`);
            setFetchError(errorMsg); // 设置错误状态
        }
      } else {
        // --- Response OK (Status 2xx) ---
        try {
          const data = await response.json();

          if (data && Array.isArray(data.vertex_pixel_mapping)) {
            // --- 修改采样规则 ---
            const sampledData = data.vertex_pixel_mapping.filter(
                (entry: MappingEntry) => {
                    const lastTwoDigits = entry.vertex_index % 100;
                    return lastTwoDigits === 5 || lastTwoDigits === 15 || lastTwoDigits === 25 || lastTwoDigits === 35 || lastTwoDigits === 45 || lastTwoDigits === 55 ;
                }
            );
            // --------------------

            if (sampledData.length > 0) {
                // --- 成功加载并解析了有效数据 ---
                setMappingData(sampledData);
                setCurrentFrameIndex(frameIndex);
                setFetchError(null); // <<<--- 只在完全成功时清除错误状态
                // --- 移除成功采样日志 ---
                // console.log(`Successfully loaded and sampled ${sampledData.length} points (vertex index ends in 05/15/25) for frame ${formattedIndex}`);
                // -----------------------
                // ----------------------------------
            } else {
                // --- 采样后无数据 ---
                // --- 移除采样无数据警告日志 ---
                // console.warn(`No data points sampled with vertex index ending in 05/15/25 for frame ${formattedIndex}. Keeping previous data.`);
                // ---------------------------
                // 不设置错误，也不清除之前的错误
            }
          } else {
            // --- JSON 结构无效 ---
            const errorMsg = `Invalid data structure for frame ${formattedIndex}`;
            console.error(`Invalid or empty mapping data structure in JSON file for frame ${formattedIndex}.`); // 保留错误日志
            setFetchError(errorMsg); // 设置错误状态
            // --------------------
          }
        } catch (parseError) {
          // --- JSON 解析失败 ---
          if (parseError instanceof SyntaxError && parseError.message.includes('Unexpected token')) {
             // --- 收到 HTML 而非 JSON ---
             // --- 移除 HTML 响应警告日志 ---
             // console.warn(`Received non-JSON response (likely HTML) for frame ${formattedIndex}. Treating as missing file. Keeping previous data.`);
             // ---------------------------
             // 不设置错误，也不清除之前的错误
             // -------------------------
          } else {
             // --- 其他解析错误 ---
             const errorMsg = `JSON parse error for frame ${formattedIndex}`;
             console.error(`${errorMsg}:`, parseError); // 保留错误日志
             setFetchError(errorMsg); // 设置错误状态
             // -------------------
          }
          // ----------------------
        }
      }
    } catch (error) { // 现在主要捕获网络错误
      // --- 网络或其他 fetch 错误 ---
      const errorMsg = `Network fetch error for frame ${formattedIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg); // 保留真正的错误日志
      setFetchError(errorMsg); // 设置错误状态
      // --------------------------
    } finally {
      setIsFetchingData(false); // 确保加载状态总是被重置
    }
  };
  // ---------------------------

  // --- 5. 添加 useEffect 监听帧变化 ---
  useEffect(() => {
    // Fetch data when targetFrameIndex changes and is different from the currently loaded frame
    if (targetFrameIndex !== currentFrameIndex) {
      fetchFrameData(targetFrameIndex);
    }
  }, [targetFrameIndex]); // Depend on the target frame index
  // ----------------------------------

  // Initialize and adjust Overlay Canvas
  useEffect(() => {
    const overlayCanvas = overlayCanvasRef.current;
    const container = containerRef.current;
    if (!overlayCanvas || !container) return;

    const ctx = overlayCanvas.getContext('2d');
    setOverlayCtx(ctx);

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      overlayCanvas.width = rect.width * dpr;
      overlayCanvas.height = rect.height * dpr;
      overlayCanvas.style.width = `${rect.width}px`;
      overlayCanvas.style.height = `${rect.height}px`;
      ctx?.scale(dpr, dpr); // Scale context for High DPI displays
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  // Initialize Three.js
  useEffect(() => {
    if (!canvasRef.current) {
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

      if (controls) {
        controls.update();
      }

      // --- 绘制逻辑 ---
      const ctx = overlayCtxRef.current;
      const cam = cameraRef.current;
      const rend = rendererRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const demoVideo = demoVideoRefRef.current;
      const currentFrameMappings = mappingDataRef.current;
      // --- Get the current visibility state from ref ---
      const shouldShowCorrespondence = showCorrespondenceRef.current;
      // ------------------------------------------------

      // --- 3. 在 animate 中计算目标帧序号 ---
      if (demoVideo && !demoVideo.paused) { // Only update target frame if video is playing
          const calculatedFrame = Math.floor(demoVideo.currentTime * VIDEO_FPS);
          // Update target frame state only if it actually changes
          if (calculatedFrame !== targetFrameIndex) {
              setTargetFrameIndex(calculatedFrame);
          }
      }
      // ------------------------------------

      // 检查绘图所需依赖项
      if (ctx && overlayCanvas && cam && rend) {
        const threeCanvas = rend.domElement;
        const overlayCanvasRect = overlayCanvas.getBoundingClientRect();

        // 清除 Overlay Canvas (只清除一次)
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, overlayCanvas.width / dpr, overlayCanvas.height / dpr);

        // --- 2. Conditionally draw correspondence ---
        if (shouldShowCorrespondence && currentFrameMappings && currentFrameMappings.length > 0) {
          currentFrameMappings.forEach(mapData => {
            let modelPointCoords: { x: number; y: number } | null = null;
            let videoPointCoords: { x: number; y: number } | null = null;

            // --- 计算模型点坐标 (基于当前 mapData) ---
            if (mapData && mapData['3d_coordinates']) {
                const [x3d, y3d, z3d] = mapData['3d_coordinates'];
                const transformedWorldPos = new THREE.Vector3(
                    (x3d + 40) / 100,
                    (y3d + 140) / 100,
                    (z3d + 260) / 100
                );
                const screenPosition = transformedWorldPos.clone().project(cam);
                if (screenPosition.z > -1 && screenPosition.z < 1) {
                    const threeCanvasWidth = threeCanvas.clientWidth;
                    const threeCanvasHeight = threeCanvas.clientHeight;
                    const threeCanvasRect = threeCanvas.getBoundingClientRect();
                    const screenX_3D = Math.round((screenPosition.x * 0.5 + 0.5) * threeCanvasWidth);
                    const screenY_3D = Math.round((-screenPosition.y * 0.5 + 0.5) * threeCanvasHeight);
                    const drawX_model = (threeCanvasRect.left - overlayCanvasRect.left) + screenX_3D;
                    const drawY_model = (threeCanvasRect.top - overlayCanvasRect.top) + screenY_3D;
                    modelPointCoords = { x: drawX_model, y: drawY_model };
                }
            }
            // --- 模型点计算结束 ---

            // --- 计算视频点坐标 (基于当前 mapData) ---
            if (mapData && mapData['2d_coordinates'] && demoVideo && demoVideo.videoWidth > 0 && demoVideo.videoHeight > 0) {
                const [x2d_intrinsic, y2d_intrinsic] = mapData['2d_coordinates'];
                const videoRect = demoVideo.getBoundingClientRect();
                const videoElementWidth = demoVideo.clientWidth;
                const videoElementHeight = demoVideo.clientHeight;
                const videoIntrinsicWidth = demoVideo.videoWidth;
                const videoIntrinsicHeight = demoVideo.videoHeight;
                const videoAspect = videoIntrinsicWidth / videoIntrinsicHeight;
                const elementAspect = videoElementWidth / videoElementHeight;
                let contentWidth = videoElementWidth;
                let contentHeight = videoElementHeight;
                let offsetX = 0;
                let offsetY = 0;
                if (videoAspect > elementAspect) {
                    contentHeight = videoElementWidth / videoAspect;
                    offsetY = (videoElementHeight - contentHeight) / 2;
                } else if (videoAspect < elementAspect) {
                    contentWidth = videoElementHeight * videoAspect;
                    offsetX = (videoElementWidth - contentWidth) / 2;
                }
                const scaleX = contentWidth / videoIntrinsicWidth;
                const scaleY = contentHeight / videoIntrinsicHeight;
                const scaledX = x2d_intrinsic * scaleX;
                const scaledY = y2d_intrinsic * scaleY;
                const videoElementOffsetX = videoRect.left - overlayCanvasRect.left;
                const videoElementOffsetY = videoRect.top - overlayCanvasRect.top;
                const drawX_video = videoElementOffsetX + offsetX + scaledX;
                const drawY_video = videoElementOffsetY + offsetY + scaledY;
                videoPointCoords = { x: drawX_video, y: drawY_video };
            }
            // --- 视频点计算结束 ---

            // --- 绘制当前点的连线和端点 ---
            if (modelPointCoords && videoPointCoords) {
                // 绘制连线 (增加透明度)
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)'; // Alpha 从 0.5 改为 0.3
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(modelPointCoords.x, modelPointCoords.y);
                ctx.lineTo(videoPointCoords.x, videoPointCoords.y);
                ctx.stroke();

                // 绘制模型点 (减小半径, 增加透明度)
                ctx.fillStyle = 'rgba(0, 255, 0, 0.6)'; // Alpha 从 0.8 改为 0.6
                ctx.beginPath();
                ctx.arc(modelPointCoords.x, modelPointCoords.y, 1.5, 0, Math.PI * 2); // 半径从 2 改为 1.5
                ctx.fill();

                // 绘制视频点 (减小半径, 增加透明度)
                ctx.fillStyle = 'rgba(0, 255, 0, 0.6)'; // Alpha 从 0.8 改为 0.6
                ctx.beginPath();
                ctx.arc(videoPointCoords.x, videoPointCoords.y, 1.5, 0, Math.PI * 2); // 半径从 2 改为 1.5
                ctx.fill();
            }
            // --- 当前点绘制结束 ---
          }); // 结束 forEach 循环
        }
        // --- 条件绘制结束 ---
      }

      // Three.js 渲染
      if (rend && newScene && cam) {
        rend.render(newScene, cam);
      }
    };
    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      if (!canvasRef.current || !newCamera || !newRenderer) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      // --- 确保宽高不为0 ---
      if (width === 0 || height === 0) return;
      // --------------------
      
      newCamera.aspect = width / height;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // --- 新增：在末尾手动调用一次 handleResize ---
    // 确保在初始渲染后设置正确的尺寸和宽高比
    // 使用 setTimeout 稍微延迟执行，给浏览器一点时间完成布局计算
    const resizeTimeoutId = setTimeout(() => {
        console.log("手动触发初始 resize");
        handleResize();
    }, 0); // 延迟 0ms，将其放入事件循环的下一个 tick
    // ------------------------------------------

    // 清理函数
    return () => {
      // --- 清除 setTimeout ---
      clearTimeout(resizeTimeoutId);
      // --------------------
      window.removeEventListener('resize', handleResize);
      
      if (canvasRef.current && newRenderer?.domElement) {
        canvasRef.current.removeChild(newRenderer.domElement);
      }
      
      newRenderer?.dispose();
      scene?.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  // 加载模型
  const loadModel = () => {
    if (!scene) {
      console.error('场景未初始化');
      return;
    }

    // 清理现有模型
    if (currentModel) {
      scene.remove(currentModel);
      currentModel.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    setIsLoading(true);

    // 创建一个 Group 来容纳模型
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    setCurrentModel(modelGroup);

    const loader = new GLTFLoader();
    loader.load(
      '/Models/liver2.glb',
      (gltf) => {
        console.log('肝脏模型加载成功');
        const liverModel = gltf.scene;
        
        // 添加统一位移
        modelGroup.position.set(0.4, 1.4, 2.6);
        modelGroup.scale.set(0.01, 0.01, 0.01);

        // 设置材质透明度 (保留)
        liverModel.traverse(child => {
          if (child instanceof THREE.Mesh) {
            const originalMaterial = child.material;
            if (Array.isArray(originalMaterial)) {
              originalMaterial.forEach(mat => {
                mat.transparent = false;
                mat.opacity = 1.0;
                mat.needsUpdate = true;
              });
            } else {
              originalMaterial.transparent = false;
              originalMaterial.opacity = 1.0;
              originalMaterial.needsUpdate = true;
            }
          }
        });

        // 将加载的模型添加到 Group
        modelGroup.add(liverModel);

        console.log('模型保持原始方向');

        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('模型加载失败:', error);
        setIsLoading(false);
      }
    );
  };

  // 监听 scene 变化，自动加载模型
  useEffect(() => {
    if (scene) {
      console.log('场景已初始化，开始加载模型...');
      loadModel();
    }
  }, [scene]);

  // 处理视频错误
  const handleVideoError = (type: 'ori' | 'demo') => {
    setVideoError(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const syncVideos = (sourceVideo: HTMLVideoElement, targetVideo: HTMLVideoElement) => {
    if (isSyncing || !sourceVideo || !targetVideo) return;
    
    setIsSyncing(true);
    
    // 同步播放状态
    if (sourceVideo.paused !== targetVideo.paused) {
      if (sourceVideo.paused) {
        targetVideo.pause();
      } else {
        targetVideo.play().catch(e => console.error("目标视频播放失败:", e));
      }
    }
    
    // 同步播放时间 (增加容差)
    if (Math.abs(sourceVideo.currentTime - targetVideo.currentTime) > 0.2) {
      targetVideo.currentTime = sourceVideo.currentTime;
    }
    
    setTimeout(() => setIsSyncing(false), 50);
  };

  // 添加点标记
  useEffect(() => {
    if (!scene || !currentModel || !currentModel.matrixWorld) return;

    // 先找到之前的 markerGroup 并移除
    const existingMarkerGroup = currentModel.getObjectByName('markerGroup');
    if (existingMarkerGroup) {
      existingMarkerGroup.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      currentModel.remove(existingMarkerGroup);
    }

    // --- 移除或注释掉以下创建蓝色球体的代码 ---
    /*
    const blenderCoordsToDebug: [number, number, number][] = [
      [82.61743927001953 , -132.31033325195312 , -234.0359344482422 ],
      // 你可以在这里添加更多坐标进行测试
    ];

    // 创建包含所有点标记的group
    const markerGroup = new THREE.Group();
    markerGroup.name = 'markerGroup';
    markerGroup.position.set(0, 0, 0);

    blenderCoordsToDebug.forEach((coords, idx) => {
      const [x, y, z] = coords;
      const debugSphere = new THREE.Mesh(
        new THREE.SphereGeometry(3, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x0000ff }) // 蓝色球体
      );
      debugSphere.position.set(x, y, z);
      debugSphere.name = `debugBlueSphere_${idx}`;

      markerGroup.add(debugSphere);
    });

    // 将标记组添加到模型组
    if (!currentModel.getObjectByName('markerGroup')) {
    currentModel.add(markerGroup);
        // 只需要确保矩阵更新，不需要在这里打印
        currentModel.updateMatrixWorld(true);
    }
    */
    // --- 移除结束 ---


    // 清理函数 - 移除 markerGroup (保留这部分逻辑是好的，即使 group 现在是空的或不存在)
    return () => {
        if (currentModel) {
            const groupToRemove = currentModel.getObjectByName('markerGroup');
            if (groupToRemove) {
                groupToRemove.traverse(object => {
                  if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                      object.material.forEach(material => material.dispose());
                    } else {
                      object.material.dispose();
                    }
                  }
                });
                currentModel.remove(groupToRemove);
            }
        }
    };
  }, [scene, currentModel]);

  return (
    <div className="demo2-container" ref={containerRef} style={{ position: 'relative' }}>
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
          <img src="/Images/liver1.png" alt="CT扫描图" />
        </div>
        
        <div className="arrow-container">
          <img src="/Images/arrow1.png" alt="Process flow" />
        </div>
        
            <div className="section-title model-title">
              3D Liver Model
            </div>
            <div className="model-container" ref={canvasRef}>
              {isLoading && <div className="loading">正在加载模型...</div>}
            </div>
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
          <div className="correspondence-toggle">
            <label htmlFor="correspondence-checkbox">Show Correspondence:</label>
            <input
              type="checkbox"
              id="correspondence-checkbox"
              checked={showCorrespondence}
              onChange={(e) => setShowCorrespondence(e.target.checked)}
            />
          </div>
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

        <canvas
          ref={overlayCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      {/* Optional: Display loading/error status */}
      {fetchError && <div className="overlay-status error">{fetchError}</div>}
    </div>
  );
};

export default Demo2;

