import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 6, 18);

  const scene = new THREE.Scene();

  //sky
  const skyLoader = new THREE.TextureLoader();
  skyLoader.load('images/sky.jpg', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
  });

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 2, 0);
  controls.update();

  //lights
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
  dirLight.position.set(-3, 6, 4);
  scene.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xff6666, 40, 10);
  pointLight.position.set(5, 5, 2);
  scene.add(pointLight);

  const pointLightMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  pointLightMarker.position.copy(pointLight.position);
  scene.add(pointLightMarker);

  //textures
  const textureLoader = new THREE.TextureLoader();

  const wallTexture = textureLoader.load('images/wall.png');
  wallTexture.colorSpace = THREE.SRGBColorSpace;

  //materials
  const brickMaterial = new THREE.MeshPhongMaterial({ map: wallTexture });
  const pillarMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
  const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xaaddff });
  const grassMaterial = new THREE.MeshPhongMaterial({ color: 0x4f8a3c });

  //green 
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(18, 1, 22),
    grassMaterial
  );
  platform.position.set(0, -0.5, -1.5);
  scene.add(platform);

  //brick path
  const pathGeometry = new THREE.BoxGeometry(1.5, 0.4, 1.5);

  for (let i = 0; i < 10; i++) {
    const brick = new THREE.Mesh(pathGeometry, brickMaterial);
    brick.position.set(0, 0.2, 6 - i * 1.6);
    scene.add(brick);
  }

  //pillars 
  const pillarGeometry = new THREE.CylinderGeometry(0.25, 0.25, 3, 24);

  for (let i = 0; i < 5; i++) {
    const z = 5 - i * 3;

    const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    leftPillar.position.set(-2.5, 1.5, z);
    scene.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    rightPillar.position.set(2.5, 1.5, z);
    scene.add(rightPillar);
  }

  //spheres
  const sphereGeometry = new THREE.SphereGeometry(0.4, 24, 24);
  const glowingSpheres = [];

  const spherePositions = [
    [-3.5, 2.2, 4],
    [3.5, 2.2, 4],
    [-3.5, 2.2, -4],
    [3.5, 2.2, -4],
  ];

  spherePositions.forEach(([x, y, z]) => {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(x, y, z);
    scene.add(sphere);
    glowingSpheres.push(sphere);
  });

  //trees
  const gltfLoader = new GLTFLoader();

  function loadTree(x, z) {
    gltfLoader.load(
      'models/Big_Tree.glb',
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDim;
        model.scale.setScalar(scale);

        const newBox = new THREE.Box3().setFromObject(model);
        const newSize = newBox.getSize(new THREE.Vector3());

        model.position.x += x;
        model.position.y += newSize.y / 2;
        model.position.z += z;

        scene.add(model);
      },
      undefined,
      (error) => {
        console.error('Error loading tree:', error);
      }
    );
  }

  
  loadTree(-6, -1);
  loadTree(6, -1);

  //flowers
const flowerLoader = new GLTFLoader();

flowerLoader.load('models/marigold.glb', (gltf) => {
  const flower = gltf.scene;

  flower.scale.set(0.4, 0.4, 0.4); 

  const spacing = 6;   
  const pairs = 2;     

  for (let i = 0; i < pairs; i++) {
    const z = i * spacing - (pairs * spacing) / 2;

    
    const f1 = flower.clone();
    f1.position.set(-4, 0, z - 1);
    scene.add(f1);

    const f2 = flower.clone();
    f2.position.set(-4, 0, z + 1);
    scene.add(f2);

    
    const f3 = flower.clone();
    f3.position.set(4, 0, z - 1);
    scene.add(f3);

    const f4 = flower.clone();
    f4.position.set(4, 0, z + 1);
    scene.add(f4);
  }
});

//tulips
const tulipLoader = new GLTFLoader();

tulipLoader.load('models/tulip.glb', (gltf) => {
  const tulip = gltf.scene;
  tulip.scale.set(1.2, 1.2, 1.2);

 
  const frontPositions = [-4, -2, 0, 2, 4];

  frontPositions.forEach((x) => {
    const flower = tulip.clone();
    flower.position.set(x, 0, 8);  
    scene.add(flower);
  });
});

//benches
const benchLoader = new GLTFLoader();

benchLoader.load('models/Bench.glb', (gltf) => {
  const bench = gltf.scene;

  
  bench.scale.set(4, 4, 4);

  
  const leftBench = bench.clone();
  leftBench.position.set(-5.2, 0, 4.2);
  leftBench.rotation.y = 3.1; 
  scene.add(leftBench);

 
  const rightBench = bench.clone();
  rightBench.position.set(5.2, 0, 4.2);
  rightBench.rotation.y = 3.1; 
  scene.add(rightBench);
});

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    //animate
    glowingSpheres.forEach((sphere, i) => {
      sphere.position.y = 2.2 + Math.sin(time * 2 + i) * 0.2;
    });

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();