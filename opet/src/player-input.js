import * as THREE from './lib/three.js';
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import {entity} from "./entity.js";

class JoyStick{
  constructor(options){
    const circle = document.createElement("div");
    circle.id = "JoyStick"
    circle.className = "opacity-hover-50 grab invisible "
    circle.style.cssText = "position:absolute; bottom:25px; width:160px; height:160px; background:rgba(126, 126, 126, 0.5); border:#444 solid medium; border-radius: 25PX 25PX 50% 50%; left:50%; transform:translateX(-50%);";
    const thumb = document.createElement("div");
    thumb.style.cssText = "position: absolute; left: 40px; top: 40px; width: 80px; height: 80px; border-radius: 50%; background: #ffffff77;";
    circle.appendChild(thumb);
    document.body.appendChild(circle);
    this.domElement = thumb;
    this.maxRadius = options.maxRadius || 70;
    this.maxRadiusSquared = this.maxRadius * this.maxRadius;
    this.onMove = options.onMove;
    this.game = options.game;
    this.origin = { left:this.domElement.offsetLeft, top:this.domElement.offsetTop };
    this.rotationDamping = options.rotationDamping || 0.06;
    this.moveDamping = options.moveDamping || 0.01;
    if (this.domElement!=undefined){
      const joystick = this;
      if ('ontouchstart' in window){
        this.domElement.addEventListener('touchstart', function(evt){ joystick.tap(evt); });
      }else{
        this.domElement.addEventListener('mousedown', function(evt){ joystick.tap(evt); });
      }
    }
  }
  
  getMousePosition(evt){
    let clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX;
    let clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY;
    return { x:clientX, y:clientY };
  }
  
  tap(evt){
    evt = evt || window.event;
    // get the mouse cursor position at startup:
    this.offset = this.getMousePosition(evt);
    const joystick = this;
    if ('ontouchstart' in window){
      document.ontouchmove = function(evt){ joystick.move(evt); };
      document.ontouchend =  function(evt){ joystick.up(evt); };
    }else{
      document.onmousemove = function(evt){ joystick.move(evt); };
      document.onmouseup = function(evt){ joystick.up(evt); };
    }
  }
  
  move(evt){
    evt = evt || window.event;
    const mouse = this.getMousePosition(evt);
    // calculate the new cursor position:
    let left = mouse.x - this.offset.x;
    let top = mouse.y - this.offset.y;
    //this.offset = mouse;
    
    const sqMag = left*left + top*top;
    if (sqMag>this.maxRadiusSquared){
      //Only use sqrt if essential
      const magnitude = Math.sqrt(sqMag);
      left /= magnitude;
      top /= magnitude;
      left *= this.maxRadius;
      top *= this.maxRadius;
    }
    // set the element's new position:
    this.domElement.style.top = `${top + this.domElement.clientHeight/2}px`;
    this.domElement.style.left = `${left + this.domElement.clientWidth/2}px`;
    
    const forward = -(top - this.origin.top + this.domElement.clientHeight/2)/this.maxRadius;
    const turn = (left - this.origin.left + this.domElement.clientWidth/2)/this.maxRadius;
    
    if (this.onMove!=undefined) this.onMove.call(this.game, forward, turn);
  }
  
  up(evt){
    if ('ontouchstart' in window){
      document.ontouchmove = null;
      document.touchend = null;
    }else{
      document.onmousemove = null;
      document.onmouseup = null;
    }
    this.domElement.style.top = `${this.origin.top}px`;
    this.domElement.style.left = `${this.origin.left}px`;
    
    this.onMove.call(this.game, 0, 0);
  }
}

export const player_input = (() => {

  class PickableComponent extends entity.Component {
    constructor() {
      super();
    }

    InitComponent() {
    }
  };

  class BasicCharacterControllerInput extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._Init();
    }
  
    _Init() {
      this._keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        dance: false,
        space: false,
        shift: false,
        zoom: false,
      };
      this._raycaster = new THREE.Raycaster();
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
      document.addEventListener('mouseup', (e) => this._onMouseUp(e), false);

      this.js = { forward:0, turn:0 };
      this.joystick = new JoyStick({
        game:this,
        onMove:this.joystickCallback
      });
      

    }
  
    _onMouseUp(event) {
      const rect = document.getElementById('threejs').getBoundingClientRect();
      const pos = {
        x: ((event.clientX - rect.left) / rect.width) * 2  - 1,
        y: ((event.clientY - rect.top ) / rect.height) * -2 + 1,
      };

      this._raycaster.setFromCamera(pos, this._params.camera);

      const pickables = this._parent._parent.Filter((e) => {
        const p = e.GetComponent('PickableComponent');
        if (!p) {
          return false;
        }
        return e._mesh;
      });
      // console.log("_onMouseUp pickables")
      // console.log(pickables)

      const ray = new THREE.Ray();
      ray.origin.setFromMatrixPosition(this._params.camera.matrixWorld);
      ray.direction.set(pos.x, pos.y, 0.5).unproject(
          this._params.camera).sub(ray.origin).normalize();

      // hack
      // document.getElementById('quest-ui').style.visibility = 'hidden';

      for (let p of pickables) {
        // GOOD ENOUGH
        const box = new THREE.Box3().setFromObject(p._mesh);
          // console.log(p,"intersectsBox",ray.intersectsBox(box))
        if (ray.intersectsBox(box)) {
          p.Broadcast({
              topic: 'input.picked'
          });
          break;
        }
      }
    }

    _onKeyDown(event) {
      // console.log(event)
      switch (event.keyCode) {
        case 87: // w
          this._keys.forward = true;
          break;
        case 65: // a
          this._keys.left = true;
          break;
        case 83: // s
          this._keys.backward = true;
          break;
        case 68: // d
          this._keys.right = true;
          break;
        case 32: // SPACE
          this._keys.space = true;
          break;
        case 16: // SHIFT
          this._keys.shift = true;
          break;
        case 69: // control
          this._keys.control = true;
          break;
        case 27: // ESCAPE
          this._keys.forward = false
          this._keys.backward = false
          this._keys.left = false
          this._keys.right = false
          this._keys.space = false
          this._keys.shift = false
          alert("GAME PAUSED")
          break;
        case 90: // z
          this._keys.zoom = true;
          break;
          // default: console.log(event.keyCode)
      }
    }
  
    _onKeyUp(event) {
      switch(event.keyCode) {
        case 87: // w
          this._keys.forward = false;
          break;
        case 65: // a
          this._keys.left = false;
          break;
        case 83: // s
          this._keys.backward = false;
          break;
        case 68: // d
          this._keys.right = false;
          break;
        case 32: // SPACE
          this._keys.space = false;
          break;
        case 16: // SHIFT
          this._keys.shift = false;
          break;
        case 69: // control
          this._keys.control = false;
          break;
        case 90: // z
          this._keys.zoom = false;
          break;
      }
    }

    joystickCallback( forward, turn )
    {
      // console.log("joystickCallback", this.js)
      this.js.forward = forward;
      this.js.turn = -turn;
      // if (forward == 0 && turn == 0)
      // {
      //   this._keys.space = true;
      // }

      if (this.js.forward > 0.8)
      {
        this._keys.shift = true;
      } else {
        this._keys.shift = false;
      }

      if (this.js.forward > 0.1)
      {
        this._keys.forward = true;
      } else if (this.js.forward < -0.95)
      {
        this._keys.space = true;
      } else {
        this._keys.forward = false;
        this._keys.space = false;
      }


      if (this.js.turn < -0.5)
      {
        this._keys.right = true;
      } else if (this.js.turn > 0.5)
      {
        this._keys.left = true;
      } else {
        this._keys.right = false;
        this._keys.left = false;
      }
    }

    // joystickCallback( forward, turn ){
    //   this.js.forward = forward;
    //   this.js.turn = -turn;
    // }
      
    updateDrive(forward=this.js.forward, turn=this.js.turn)
    {
      const maxSteerVal = 0.5;
    }

  };

  return {
    BasicCharacterControllerInput: BasicCharacterControllerInput,
    PickableComponent: PickableComponent,
  };

})();