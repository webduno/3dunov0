import * as THREE from './lib/three.js';

export const SCENE_TEMPLATES = (() => {
  function getBasicLight()
  {
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    // light.position.set(-500, 500, 500);
    // light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1000.0;
    light.shadow.camera.left = 225;
    light.shadow.camera.right = -225;
    light.shadow.camera.top = 225;
    light.shadow.camera.bottom = -225;
    
    return light
  }
  
  return {
      getBasicLight,
  };
})();