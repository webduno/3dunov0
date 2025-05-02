import * as THREE from './lib/three.js';
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';
import {entity} from './entity.js';


export const third_person_camera = (() => {
  
  class ThirdPersonCamera extends entity.Component {
    constructor(params) {
      super();

      this._params = params;
      this._camera = params.camera;
      this._cinematic = 0.1;

      this._currentPosition = new THREE.Vector3();
      this._currentLookat = new THREE.Vector3();

      this._offset = 0
    }

    _CalculateIdealOffset() {
      let idealOffset
      if (this._offset != 0)
      {
        idealOffset = new THREE.Vector3(0, 20, -25);
      } else {
        idealOffset = new THREE.Vector3(0, 40, -50);
      }
      idealOffset.applyQuaternion(this._params.target._rotation);
      idealOffset.add(this._params.target._position);
      return idealOffset;
    }

    _CalculateIdealLookat() {
      const idealLookat = new THREE.Vector3(0, 15, 0);
      idealLookat.applyQuaternion(this._params.target._rotation);
      idealLookat.add(this._params.target._position);
      return idealLookat;
    }

    Update(timeElapsed) {
      const idealOffset = this._CalculateIdealOffset();
      const idealLookat = this._CalculateIdealLookat();

      // const t = 0.05;
      // const t = 4.0 * timeElapsed;
      const t = 1.0 - Math.pow(this._cinematic, timeElapsed);

      // console.log()

      this._currentPosition.lerp(idealOffset, t);
      this._currentLookat.lerp(idealLookat, t);

      this._camera.position.copy(this._currentPosition);
      this._camera.lookAt(this._currentLookat);
    }
  }

  return {
    ThirdPersonCamera: ThirdPersonCamera
  };

})();