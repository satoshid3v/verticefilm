// Vértice Flame & Apple-Kinetic 3D Engine
// Desarrollado por Vertice Codeium
// Integra Three.js con extrusión vectorial SVG paramétrica y shaders de gradiente espectral

import * as THREE from './three.module.js';

export function initKineticHero(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 7.2);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);

  // 1. Definición del Shape vectorial a partir de las coordenadas del isotipo de marca
  const shape = new THREE.Shape();
  // Vértice superior central
  shape.moveTo(0, 1.8);
  shape.lineTo(0.55, -0.15);   // Lado derecho aguja
  shape.lineTo(1.4, -0.4);     // Ala derecha exterior
  shape.lineTo(1.85, -1.1);    // Cúspide lateral derecha
  shape.lineTo(0.75, -2.15);   // Vértice base derecho
  shape.lineTo(0.42, -1.98);   // Borde interno inferior
  shape.lineTo(0.68, -1.45);   // Quiebre ala interna
  shape.lineTo(0, -0.45);      // Conexión central
  // Reflejo simétrico izquierdo
  shape.lineTo(-0.68, -1.45);
  shape.lineTo(-0.42, -1.98);
  shape.lineTo(-0.75, -2.15);
  shape.lineTo(-1.85, -1.1);
  shape.lineTo(-1.4, -0.4);
  shape.lineTo(-0.55, -0.15);
  shape.closePath();

  // 2. Parámetros de Extrusión Física
  const extrudeSettings = {
    depth: 0.38,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.06
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();

  // 3. Shader Inyectado para Gradiente Espectral Reactivo a Luces
  const material = new THREE.MeshStandardMaterial({
    roughness: 0.18,
    metalness: 0.85
  });

  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
       varying float vY;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       vY = position.y;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       varying float vY;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      `
      // Normalización en base a la altura geométrica (-1.8 a 1.8)
      float t = clamp((vY + 1.25) / 2.5, 0.0, 1.0);
      vec3 cPurple  = vec3(0.376, 0.078, 0.894); // #6014E4
      vec3 cMagenta = vec3(0.831, 0.000, 0.471); // #D40078
      vec3 cOrange  = vec3(1.000, 0.271, 0.000); // #FF4500
      vec3 cYellow  = vec3(1.000, 0.867, 0.000); // #FFDD00

      vec3 flameColor;
      if (t < 0.33) {
        flameColor = mix(cPurple, cMagenta, t / 0.33);
      } else if (t < 0.66) {
        flameColor = mix(cMagenta, cOrange, (t - 0.33) / 0.33);
      } else {
        flameColor = mix(cOrange, cYellow, (t - 0.66) / 0.34);
      }
      vec4 diffuseColor = vec4(flameColor, opacity);
      `
    );
  };

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Aura perimetral sutil
  const rimLightGeo = new THREE.TorusGeometry(2.35, 0.015, 16, 100);
  const rimLightMat = new THREE.MeshBasicMaterial({
    color: 0xFF4500,
    transparent: true,
    opacity: 0.22
  });
  const rimMesh = new THREE.Mesh(rimLightGeo, rimLightMat);
  rimMesh.rotation.x = Math.PI / 2.2;
  scene.add(rimMesh);

  // Iluminación cinemática
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffeedd, 3.2);
  keyLight.position.set(4, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x6014e4, 2.8);
  fillLight.position.set(-5, -4, 3);
  scene.add(fillLight);

  const cursorLight = new THREE.PointLight(0xffdd00, 2.5, 12);
  cursorLight.position.set(0, 0, 3.5);
  scene.add(cursorLight);

  // Estado del cursor cinemático
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const onMouseMove = (e) => {
    const rect = container.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    mouse.targetX = (clientX / rect.width) * 2 - 1;
    mouse.targetY = -(clientY / rect.height) * 2 + 1;
  };
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Responsive resize
  const onResize = () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ajuste responsive para móviles
    if (w < 768) {
      mesh.scale.set(0.68, 0.68, 0.68);
      rimMesh.scale.set(0.68, 0.68, 0.68);
    } else {
      mesh.scale.set(1.0, 1.0, 1.0);
      rimMesh.scale.set(1.0, 1.0, 1.0);
    }
  };
  window.addEventListener('resize', onResize);
  onResize();

  // Render loop con amortiguación física (Vértice Kinetic Easing)
  let clock = new THREE.Clock();
  let animId;

  const animate = () => {
    animId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Damping cinemático
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Rotación suave del monolito 3D
    mesh.rotation.y = mouse.x * 0.75 + Math.sin(elapsedTime * 0.4) * 0.08;
    mesh.rotation.x = -mouse.y * 0.45 + Math.cos(elapsedTime * 0.3) * 0.05;

    // Flotación sutil en eje Y
    mesh.position.y = Math.sin(elapsedTime * 1.4) * 0.08;

    // Luz reactiva sigue la posición del cursor en el plano frontal
    cursorLight.position.x = mouse.x * 3.8;
    cursorLight.position.y = mouse.y * 2.8;

    // Rotación lenta del anillo exterior
    rimMesh.rotation.z = elapsedTime * 0.15;
    rimMesh.position.y = mesh.position.y;

    renderer.render(scene, camera);
  };

  animate();

  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    cancelAnimationFrame(animId);
    renderer.dispose();
  };
}
