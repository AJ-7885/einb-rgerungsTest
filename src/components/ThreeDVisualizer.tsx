import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GERMAN_STATES } from '../data/states';
import { Volume2, ChevronDown, ChevronUp, Layers, MapPin, History, Eye } from 'lucide-react';
import { speechService } from '../services/speechService';
import { TranslationMode } from '../types';

interface ThreeDVisualizerProps {
  onSelectState?: (stateCode: string) => void;
  selectedStateCode?: string;
  translationMode: TranslationMode;
  speechRate?: number;
}

type SceneMode = 'reichstag' | 'states' | 'timeline';

export const ThreeDVisualizer: React.FC<ThreeDVisualizerProps> = ({
  onSelectState,
  selectedStateCode = 'BE',
  translationMode,
  speechRate = 0.85,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [sceneMode, setSceneMode] = useState<SceneMode>('reichstag');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [activeItemInfo, setActiveItemInfo] = useState<{
    titleDe: string;
    titleEn: string;
    titleFa: string;
    descDe: string;
    descEn: string;
    descFa: string;
    term?: string;
  }>({
    titleDe: 'Gewaltenteilung & Verfassungsorgane',
    titleEn: 'Separation of Powers & Constitutional Organs',
    titleFa: 'تفکیک قوا و ارکان قانون اساسی',
    descDe: 'Klicken Sie auf die 3 Säulen der Demokratie: Legislative (Bundestag), Exekutive (Regierung) und Judikative (Verfassungsgericht).',
    descEn: 'Click the 3 democratic pillars: Legislative (Parliament), Executive (Government), and Judiciary (Constitutional Court).',
    descFa: 'روی ۳ ستون دموکراسی کلیک کنید: مقننه (مجلس)، مجریه (دولت) و قضائیه (دادگاه قانون اساسی).',
    term: 'Gewaltenteilung',
  });

  const activeTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const activeCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 8, 14));

  useEffect(() => {
    if (!mountRef.current) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Studio Environment map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.0);
    rimLight.position.set(-8, 5, -8);
    scene.add(rimLight);

    // Ground platform
    const groundGeo = new THREE.CylinderGeometry(9, 9.5, 0.4, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.2;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Soft contact shadow circle
    const shadowGeo = new THREE.RingGeometry(0.1, 8.8, 48);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    scene.add(shadowMesh);

    // Interactive clickable meshes pool
    const clickables: THREE.Object3D[] = [];
    const rootSceneGroup = new THREE.Group();
    scene.add(rootSceneGroup);

    // BUILD SCENE 1: Reichstag Dome & 3 Pillars of Power
    function buildReichstagScene() {
      rootSceneGroup.clear();
      clickables.length = 0;

      // Base Parliament Plenary Floor
      const baseGeo = new THREE.CylinderGeometry(4.5, 5.0, 0.6, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.5,
        metalness: 0.4,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.3;
      baseMesh.receiveShadow = true;
      rootSceneGroup.add(baseMesh);

      // Glass Dome (Procedural Reichstag Dome)
      const domeGeo = new THREE.SphereGeometry(3.6, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.52);
      const domeMat = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        metalness: 0.1,
        roughness: 0.15,
        transmission: isSoftwareGl ? 0 : 0.85,
        transparent: true,
        opacity: isSoftwareGl ? 0.35 : 0.8,
        ior: 1.5,
        depthWrite: false,
      });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.y = 0.6;
      rootSceneGroup.add(dome);

      // Spiral Light Cone (Center of Reichstag dome)
      const coneGeo = new THREE.ConeGeometry(1.2, 3.2, 16, 1, true);
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.2,
        metalness: 0.85,
        side: THREE.DoubleSide,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 2.2;
      cone.rotation.x = Math.PI;
      rootSceneGroup.add(cone);

      // 3 Constitutional Pillars (Separation of Powers)
      const pillars = [
        {
          id: 'legislative',
          titleDe: '1. Legislative: Bundestag & Bundesrat',
          titleEn: '1. Legislative: Parliament & Federal Council',
          titleFa: '۱. قوه مقننه: بوندستاگ و بوندسرات',
          descDe: 'Beschließt die Gesetze und kontrolliert die Bundesregierung. Wird direkt vom Volk gewählt.',
          descEn: 'Passes federal legislation and scrutinizes the government. Directly elected by the voters.',
          descFa: 'قوانین فدرال را تصویب و بر کار دولت نظارت می‌کند. مستقیماً با رأی مردم برگزیده می‌شود.',
          color: 0x38bdf8,
          x: -3.8,
          z: 1.8,
          term: 'Legislative',
        },
        {
          id: 'executive',
          titleDe: '2. Exekutive: Bundesregierung & Kanzler',
          titleEn: '2. Executive: Federal Government & Chancellor',
          titleFa: '۲. قوه مجریه: دولت فدرال و صدراعظم',
          descDe: 'Führt die Gesetze aus. Besteht aus dem Bundeskanzler und den Bundesministern.',
          descEn: 'Executes and enforces the laws. Composed of the Chancellor and Federal Ministers.',
          descFa: 'قوانین را اجرا می‌کند و امور اجرایی کشور را اداره می‌نماید.',
          color: 0xf59e0b,
          x: 0,
          z: 4.2,
          term: 'Exekutive',
        },
        {
          id: 'judiciary',
          titleDe: '3. Judikative: Bundesverfassungsgericht',
          titleEn: '3. Judiciary: Constitutional Court',
          titleFa: '۳. قوه قضائیه: دادگاه قانون اساسی',
          descDe: 'Wacht über das Grundgesetz in Karlsruhe. Unabhängige Richter schützen die Bürger vor Willkür.',
          descEn: 'Protects the Basic Law in Karlsruhe. Independent judges protect citizens against arbitrary power.',
          descFa: 'نگهبان قانون اساسی در کارلسروهه. قضات مستقل از شهروندان در برابر نقض قانون محافظت می‌کنند.',
          color: 0xef4444,
          x: 3.8,
          z: 1.8,
          term: 'Judikative',
        },
      ];

      pillars.forEach(p => {
        const pillarGroup = new THREE.Group();
        pillarGroup.position.set(p.x, 0, p.z);

        // Pedestal
        const colGeo = new THREE.CylinderGeometry(0.7, 0.85, 2.4, 20);
        const colMat = new THREE.MeshStandardMaterial({
          color: p.color,
          roughness: 0.3,
          metalness: 0.6,
        });
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.y = 1.2;
        col.castShadow = true;
        pillarGroup.add(col);

        // Glowing Emblem Sphere on top
        const orbGeo = new THREE.DodecahedronGeometry(0.55);
        const orbMat = new THREE.MeshStandardMaterial({
          color: p.color,
          roughness: 0.1,
          metalness: 0.9,
          emissive: p.color,
          emissiveIntensity: 0.4,
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.y = 2.8;
        pillarGroup.add(orb);

        pillarGroup.userData = p;
        rootSceneGroup.add(pillarGroup);
        clickables.push(col, orb);
      });
    }

    // BUILD SCENE 2: 16 Federal States (Bundesländer)
    function buildStatesScene() {
      rootSceneGroup.clear();
      clickables.length = 0;

      // Arrange 16 states in an ergonomic geographical arrangement
      GERMAN_STATES.forEach((st, idx) => {
        const angle = (idx / GERMAN_STATES.length) * Math.PI * 2;
        const radius = 5.2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius * 0.85;

        const isSelected = st.code === selectedStateCode;
        const stateGroup = new THREE.Group();
        stateGroup.position.set(x, 0, z);

        const pillarGeo = new THREE.CylinderGeometry(0.5, 0.6, isSelected ? 2.6 : 1.6, 6);
        const pillarMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xf59e0b : 0x475569,
          metalness: 0.7,
          roughness: 0.3,
          emissive: isSelected ? 0xd97706 : 0x000000,
          emissiveIntensity: isSelected ? 0.4 : 0,
        });
        const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
        pillarMesh.position.y = (isSelected ? 2.6 : 1.6) / 2;
        pillarMesh.castShadow = true;
        stateGroup.add(pillarMesh);

        // Marker disc
        const discGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.12, 16);
        const discMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xfef08a : 0x94a3b8,
          metalness: 0.5,
          roughness: 0.2,
        });
        const discMesh = new THREE.Mesh(discGeo, discMat);
        discMesh.position.y = isSelected ? 2.7 : 1.7;
        stateGroup.add(discMesh);

        stateGroup.userData = {
          titleDe: `${st.name} (${st.capital})`,
          titleEn: `${st.nameEn} (Capital: ${st.capitalEn})`,
          titleFa: `${st.nameFa} (پایتخت: ${st.capitalFa})`,
          descDe: `${st.description.de} Einwohner: ${st.population}`,
          descEn: `${st.description.en} Population: ${st.population}`,
          descFa: `${st.description.fa} جمعیت: ${st.population}`,
          stateCode: st.code,
          term: st.name,
        };

        rootSceneGroup.add(stateGroup);
        clickables.push(pillarMesh, discMesh);
      });
    }

    // BUILD SCENE 3: Historical Milestones Timeline
    function buildTimelineScene() {
      rootSceneGroup.clear();
      clickables.length = 0;

      const milestones = [
        {
          year: '1949',
          titleDe: '1949: Grundgesetz & Gründung der BRD',
          titleEn: '1949: Basic Law & Founding of BRD',
          titleFa: '۱۹۴۹: تصویب قانون اساسی و تأسیس جمهوری فدرال',
          descDe: 'Verkündigung des Grundgesetzes in Bonn am 23. Mai 1949. Konrad Adenauer wird erster Bundeskanzler.',
          descEn: 'Promulgation of the Basic Law in Bonn on May 23, 1949. Konrad Adenauer becomes first Chancellor.',
          descFa: 'ابلاغ قانون اساسی در ۲۳ مه ۱۹۴۹ در بن. کنراد آدناور نخستین صدراعظم شد.',
          x: -5.0,
          color: 0x38bdf8,
          term: 'Grundgesetz',
        },
        {
          year: '1961',
          titleDe: '1961: Bau der Berliner Mauer',
          titleEn: '1961: Construction of the Berlin Wall',
          titleFa: '۱۹۶۱: ساخت دیوار برلین',
          descDe: 'Am 13. August 1961 riegelt die DDR-Führung Ost-Berlin ab und teilt Deutschland für 28 Jahre.',
          descEn: 'On August 13, 1961, the East German regime seals the border, dividing Germany for 28 years.',
          descFa: 'در ۱۳ اوت ۱۹۶۱ حکومت آلمان شرقی دیوار برلین را ساخت و کشور را به مدت ۲۸ سال تقسیم کرد.',
          x: -1.7,
          color: 0x94a3b8,
          term: 'Berliner Mauer',
        },
        {
          year: '1989',
          titleDe: '1989: Friedliche Revolution & Mauerfall',
          titleEn: '1989: Peaceful Revolution & Fall of Wall',
          titleFa: '۱۹۸۹: انقلاب مسالمت‌آمیز و سقوط دیوار برلین',
          descDe: 'Am 9. November 1989 fällt die Berliner Mauer nach mutigen Bürgerprotesten ("Wir sind das Volk").',
          descEn: 'On November 9, 1989, the Berlin Wall falls following courageous citizen demonstrations.',
          descFa: 'در ۹ نوامبر ۱۹۸۹ با تظاهرات شجاعانه مردم، دیوار برلین سقوط کرد.',
          x: 1.7,
          color: 0xf59e0b,
          term: 'Mauerfall',
        },
        {
          year: '1990',
          titleDe: '1990: Deutsche Wiedervereinigung',
          titleEn: '1990: German Reunification (Oct 3)',
          titleFa: '۱۹۹۰: اتحاد دوباره آلمان (۳ اکتبر)',
          descDe: 'Am 3. Oktober 1990 wird Deutschland nach 45 Jahren wieder ein vereinter demokratischer Staat.',
          descEn: 'On October 3, 1990, Germany officially reunifies into one democratic nation (National Day).',
          descFa: 'در ۳ اکتبر ۱۹۹۰ آلمان پس از ۴۵ سال مجدداً متحد شد و این روز تعطیل ملی است.',
          x: 5.0,
          color: 0x10b981,
          term: 'Wiedervereinigung',
        },
      ];

      milestones.forEach(m => {
        const stoneGroup = new THREE.Group();
        stoneGroup.position.set(m.x, 0, 0);

        // Monument Pillar
        const pillarGeo = new THREE.BoxGeometry(1.6, 3.4, 0.8);
        const pillarMat = new THREE.MeshStandardMaterial({
          color: m.color,
          metalness: 0.6,
          roughness: 0.25,
        });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.y = 1.7;
        pillar.castShadow = true;
        stoneGroup.add(pillar);

        // Capstone
        const capGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.25, 20);
        const capMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          metalness: 0.8,
          roughness: 0.1,
        });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 3.55;
        stoneGroup.add(cap);

        stoneGroup.userData = m;
        rootSceneGroup.add(stoneGroup);
        clickables.push(pillar, cap);
      });
    }

    if (sceneMode === 'reichstag') buildReichstagScene();
    else if (sceneMode === 'states') buildStatesScene();
    else if (sceneMode === 'timeline') buildTimelineScene();

    // Raycaster for click/tap interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickables, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.titleDe && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData?.titleDe) {
          const data = hitObj.userData;
          setActiveItemInfo({
            titleDe: data.titleDe,
            titleEn: data.titleEn,
            titleFa: data.titleFa,
            descDe: data.descDe,
            descEn: data.descEn,
            descFa: data.descFa,
            term: data.term,
          });

          // Pronounce term
          if (data.term) {
            speechService.speakWord(data.term, speechRate);
          }

          if (data.stateCode && onSelectState) {
            onSelectState(data.stateCode);
          }

          // Animate camera target towards clicked item
          activeTargetPos.current.copy(hitObj.position);
          activeCameraPos.current.set(
            hitObj.position.x * 0.4,
            6,
            hitObj.position.z + 9
          );
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Animation & Pacing loop
    let animId = 0;
    const clock = new THREE.Clock();

    function animate() {
      const delta = Math.min(clock.getDelta(), 0.1);

      // Smooth camera interpolation with damping
      camera.position.x = THREE.MathUtils.damp(camera.position.x, activeCameraPos.current.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, activeCameraPos.current.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, activeCameraPos.current.z, 3.5, delta);

      camera.lookAt(activeTargetPos.current);

      // Gentle continuous turntable rotation when resting
      if (rootSceneGroup) {
        rootSceneGroup.rotation.y += delta * 0.1;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    }

    animate();

    // Handle container resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
    };
  }, [sceneMode, selectedStateCode, speechRate, onSelectState]);

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-xl">
      {/* 3D WebGL Canvas container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Top Brand / Mode Switcher */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 backdrop-blur-xs">
        <button
          onClick={() => {
            setSceneMode('reichstag');
            activeTargetPos.current.set(0, 0, 0);
            activeCameraPos.current.set(0, 8, 14);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            sceneMode === 'reichstag' ? 'bg-amber-500 text-slate-950 font-semibold' : 'hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Reichstag & Gewaltenteilung</span>
        </button>

        <button
          onClick={() => {
            setSceneMode('states');
            activeTargetPos.current.set(0, 0, 0);
            activeCameraPos.current.set(0, 10, 15);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            sceneMode === 'states' ? 'bg-amber-500 text-slate-950 font-semibold' : 'hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>16 Bundesländer</span>
        </button>

        <button
          onClick={() => {
            setSceneMode('timeline');
            activeTargetPos.current.set(0, 0, 0);
            activeCameraPos.current.set(0, 7, 13);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            sceneMode === 'timeline' ? 'bg-amber-500 text-slate-950 font-semibold' : 'hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Zeitleiste 1949–1990</span>
        </button>
      </div>

      {/* Unified Bottom Control & Concept Dock (Strict adherence to Three.js Collapsible Dock standard) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl transition-transform duration-300 ease-out ${
          isControlsCollapsed ? 'translate-y-[calc(100%-38px)]' : 'translate-y-0'
        }`}
      >
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          {/* Header & Collapse Drawer Toggle */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold text-sm tracking-wide">
                {activeItemInfo.titleDe}
              </span>
              {activeItemInfo.term && (
                <button
                  onClick={() => speechService.speakWord(activeItemInfo.term!, speechRate)}
                  className="p-1 rounded-md text-amber-400 hover:bg-slate-800 transition"
                  title="Aussprache anhören (Listen to pronunciation)"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              {isControlsCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Details einblenden</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Ausblenden</span>
                </>
              )}
            </button>
          </div>

          {/* Multilingual Explanations with English and Persian translations */}
          {!isControlsCollapsed && (
            <div className="space-y-2 text-xs">
              <p className="text-slate-300 leading-relaxed">
                {activeItemInfo.descDe}
              </p>

              {(translationMode === 'en' || translationMode === 'both') && (
                <div className="pt-1.5 border-t border-slate-800/60 text-slate-400">
                  <span className="font-semibold text-slate-300 mr-1.5">EN:</span>
                  <span>{activeItemInfo.descEn}</span>
                </div>
              )}

              {(translationMode === 'fa' || translationMode === 'both') && (
                <div className="pt-1.5 border-t border-slate-800/60 text-amber-200/90 font-fa" dir="rtl">
                  <span className="font-semibold text-amber-300 ml-1.5">فارسی:</span>
                  <span>{activeItemInfo.descFa}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
