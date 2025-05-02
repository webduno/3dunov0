import * as THREE from './lib/three.js';
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

// import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {FBXLoader} from './lib/FBXLoader.js';

import {entity} from './entity.js';
import {finite_state_machine} from './finite-state-machine.js';
import {player_state} from './player-state.js';


export const player_entity = (() => {

  class CharacterFSM extends finite_state_machine.FiniteStateMachine {
    constructor(proxy) {
      super();
      this._proxy = proxy;
      this._Init();




      // this.audioManager.background.current.volume = .25


    }
  
    _Init() {
      this._AddState('idle', player_state.IdleState);
      this._AddState('walk', player_state.WalkState);
      this._AddState('run', player_state.RunState);
      this._AddState('hover', player_state.HoverState);
      this._AddState('attack', player_state.AttackState);
      this._AddState('death', player_state.DeathState);
      this._AddState('dance', player_state.DanceState);
    }
  };
  
  class BasicCharacterControllerProxy {
    constructor(animations) {
      this._animations = animations;
    }
  
    get animations() {
      return this._animations;
    }
  };


  class BasicCharacterController extends entity.Component {
    constructor(params) {
      super();
      this._Init(params);

      this.audioManager = {}
      this.audioManager.player = {
        
        hit1: new Audio("https://webduno.com/opet/_resources/audio/collision/clamour3.wav"),
      }
      this.audioManager.walk = {
        steps1: new Audio("https://webduno.com/opet/_resources/audio/walk/sfx_step_grass_l.flac"),

        // bg4: new Audio("https://webduno.com/opet/_resources/audio/Pluto.mp3"),
        // bg5: new Audio("https://webduno.com/opet/_resources/audio/OnTheBach.mp3"),
        current: {},
      }
      // let randomSelection = 1 + parseInt(Math.random()*Object.keys(this.audioManager.background).length - 1)
      // console.log("randomSelection parseInt(Math.random()*4)", randomSelection)
      this.audioManager.walk.current = this.audioManager.walk["steps"+1]
      this.audioManager.player.current = this.audioManager.player["hit1"+1]

      // console.table({boundaries: params.boundaries})
      this.boundaries = []
      // this.boundaries = params.boundaries
    }

    _Init(params) {
      this._params = params;
      this.canFly = this._params.fly === true
      this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this._acceleration = new THREE.Vector3(1, 0.125, 65.0);
      this._sideAcceleration = new THREE.Vector3(1, 0.1, 65.0);
      this._velocity = new THREE.Vector3(0, 0, 0);
      this._position = new THREE.Vector3();
  
      this._animations = {};
      this._stateMachine = new CharacterFSM(
          new BasicCharacterControllerProxy(this._animations));
  
      // this._LoadModels();
      // this._LoadCustomModels();
      this._LoadMinecraftModels();
      // this._LoadPetModels();
    }

    InitComponent() {
      this._RegisterHandler('health.death', (m) => { this._OnDeath(m); });
    }

    _OnDeath(msg) {
      this._stateMachine.SetState('death');
    }

    _LoadMinecraftModels() {
      const loader = new FBXLoader();
      loader.setPath('https://webduno.com/opet/_resources/fbx/guy/');
      loader.load('guy.fbx', (fbx) => {
        this._target = fbx;
        // this._target.scale.setScalar(1);
        // this._target.scale.setScalar(0.0056);
        this._target.scale.setScalar(0.015);
        this._params.scene.add(this._target);
  
        this._bones = {};
        for (let b of this._target.children[0].skeleton.bones) {
          this._bones[b.name] = b;
        }

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });

        this.Broadcast({
            topic: 'load.character',
            model: this._target,
            bones: this._bones,
        });

        this._mixer = new THREE.AnimationMixer(this._target);

        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
    
          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState('idle');
        };
  
        const loader = new FBXLoader(this._manager);

        // loader.setPath('https://webduno.com/opet/_resources/fbx/guy/');
        let baseResUrl = "https://webduno.com/opet/_resources/fbx/guy/"
        // loader.load('Sword And Shield Idle.fbx', (a) => { _OnLoad('idle', a); });
        loader.load(baseResUrl+'Standing W_Briefcase Idle.fbx', (a) => { _OnLoad('idle', a); });
        loader.load(baseResUrl+'Lifting.fbx', (a) => { _OnLoad('attack', a); });
        if (this.canFly)
        {
          loader.load(baseResUrl+'Running Crawl.fbx', (a) => { _OnLoad('walk', a); });
          loader.load(baseResUrl+'Treading Water.fbx', (a) => { _OnLoad('run', a); });
        } else {
          loader.load(baseResUrl+'Standard Walk.fbx', (a) => { _OnLoad('walk', a); });
          loader.load(baseResUrl+'Standard Run.fbx', (a) => { _OnLoad('run', a); });
        }
        // loader.load(baseResUrl+'Swimming To Edge.fbx', (a) => { _OnLoad('run', a); });
        loader.load(baseResUrl+'Swimming To Edge.fbx', (a) => { _OnLoad('hover', a); });
        loader.load(baseResUrl+'Dying Backwards.fbx', (a) => { _OnLoad('death', a); });
        // loader.load(baseResUrl+'Tut Hip Hop Dance.fbx', (a) => { _OnLoad('dance', a); });
        loader.load(baseResUrl+'Ymca Dance.fbx', (a) => { _OnLoad('dance', a); });
        
      });
    }

    ___LoadMinecraftModels() {
      const loader = new FBXLoader();
      // loader.setPath('https://webduno.com/opet/_resources/pets/stebb/');
      let baseResUrl = "https://webduno.com/opet/_resources/pets/stebb/"

      loader.load(baseResUrl+'stebb2.fbx', (fbx) => {
        this._target = fbx;
        // this._target.scale.setScalar(1);
        // this._target.scale.setScalar(0.0056);
        this._target.scale.setScalar(0.056);
        this._params.scene.add(this._target);
  
        this._bones = {};
        for (let b of this._target.children[1].skeleton.bones) {
          this._bones[b.name] = b;
        }

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });

        this.Broadcast({
            topic: 'load.character',
            model: this._target,
            bones: this._bones,
        });

        this._mixer = new THREE.AnimationMixer(this._target);

        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
    
          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState('idle');
        };
  
        const loader = new FBXLoader(this._manager);

        // loader.setPath('https://webduno.com/opet/_resources/pets/stebb/');
        // let baseResUrl = "https://webduno.com/opet/_resources/pets/stebb/"
        // loader.load('Sword And Shield Idle.fbx', (a) => { _OnLoad('idle', a); });
        loader.load('https://webduno.com/opet/_resources/pets/stebb/Standing W_Briefcase Idle.fbx', (a) => { _OnLoad('idle', a); });
        loader.load('https://webduno.com/opet/_resources/pets/stebb/Hiding Grab.fbx', (a) => { _OnLoad('attack', a); });
        if (this.canFly)
        {
          loader.load('https://webduno.com/opet/_resources/pets/stebb/Running.fbx', (a) => { _OnLoad('walk', a); });
          loader.load('https://webduno.com/opet/_resources/pets/stebb/Swimming To Edge.fbx', (a) => { _OnLoad('run', a); });
        } else {
          loader.load('https://webduno.com/opet/_resources/pets/stebb/Walking.fbx', (a) => { _OnLoad('walk', a); });
          loader.load('https://webduno.com/opet/_resources/pets/stebb/Running.fbx', (a) => { _OnLoad('run', a); });
        }
        // loader.load('https://webduno.com/opet/_resources/pets/stebb/Swimming To Edge.fbx', (a) => { _OnLoad('run', a); });
        loader.load('https://webduno.com/opet/_resources/pets/stebb/Skateboarding.fbx', (a) => { _OnLoad('hover', a); });
        loader.load('https://webduno.com/opet/_resources/pets/stebb/Getting Hit Backwards.fbx', (a) => { _OnLoad('death', a); });
        // loader.load('https://webduno.com/opet/_resources/pets/stebb/Tut Hip Hop Dance.fbx', (a) => { _OnLoad('dance', a); });
        loader.load('https://webduno.com/opet/_resources/pets/stebb/Falling Flat Impact.fbx', (a) => { _OnLoad('dance', a); });
        
      });
    }

    _LoadMagicaModels() {
      const loader = new FBXLoader();
      // loader.setPath('https://webduno.com/opet/_resources/fbx/girl/');
      loader.load('https://webduno.com/opet/_resources/fbx/girl/girl2.fbx', (fbx) => {
        this._target = fbx;
        // this._target.scale.setScalar(1);
        // this._target.scale.setScalar(0.0056);
        this._target.scale.setScalar(0.056);
        this._params.scene.add(this._target);
  
        this._bones = {};
        for (let b of this._target.children[1].skeleton.bones) {
          this._bones[b.name] = b;
        }

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });

        this.Broadcast({
            topic: 'load.character',
            model: this._target,
            bones: this._bones,
        });

        this._mixer = new THREE.AnimationMixer(this._target);

        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
    
          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState('idle');
        };
  
        const loader = new FBXLoader(this._manager);

        loader.setPath('https://webduno.com/opet/_resources/pets/stebb/');
        // loader.load('Sword And Shield Idle.fbx', (a) => { _OnLoad('idle', a); });
        loader.load('Standing W_Briefcase Idle.fbx', (a) => { _OnLoad('idle', a); });
        loader.load('Picking Up.fbx', (a) => { _OnLoad('attack', a); });
        if (this.canFly)
        {
          loader.load('Run Forward.fbx', (a) => { _OnLoad('walk', a); });
          loader.load('Swimming To Edge.fbx', (a) => { _OnLoad('run', a); });
        } else {
          loader.load('Standard Walk.fbx', (a) => { _OnLoad('walk', a); });
          loader.load('Run Forward.fbx', (a) => { _OnLoad('run', a); });
        }
        // loader.load('Swimming To Edge.fbx', (a) => { _OnLoad('run', a); });
        loader.load('Picking Up.fbx', (a) => { _OnLoad('hover', a); });
        loader.load('Picking Up.fbx', (a) => { _OnLoad('death', a); });
        // loader.load('Tut Hip Hop Dance.fbx', (a) => { _OnLoad('dance', a); });
        loader.load('Picking Up.fbx', (a) => { _OnLoad('dance', a); });
        
      });
    }

    _LoadPetModels() {
      const loader = new FBXLoader();
      loader.setPath('https://webduno.com/opet/_resources/livepets/penguin/');
      loader.load('penguin.fbx', (fbx) => {
        this._target = fbx;
        this._target.scale.setScalar(2);
        // this._target.scale.setScalar(0.0056);
        // this._target.scale.setScalar(0.056);
        this._params.scene.add(this._target);
  
        this._bones = {};
        // console.log("this._target")
        // console.log(this._target)
        for (let b of this._target.children[0].skeleton.bones) {
          this._bones[b.name] = b;
        }

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });

        this.Broadcast({
            topic: 'load.character',
            model: this._target,
            bones: this._bones,
        });

        this._mixer = new THREE.AnimationMixer(this._target);

        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
    
          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState('idle');
        };

        const loader = new FBXLoader(this._manager);
        loader.setPath('https://webduno.com/opet/_resources/livepets/penguin/');
        loader.load('Standard Idle.fbx', (a) => { _OnLoad('idle', a); });
        loader.load('Standard Walk.fbx', (a) => { _OnLoad('walk', a); });
        loader.load('Running.fbx', (a) => { _OnLoad('run', a); });
        loader.load('Dying Backwards.fbx', (a) => { _OnLoad('death', a); });
        loader.load('Petting Animal.fbx', (a) => { _OnLoad('attack', a); });
      });
    }

    _FindIntersections(pos) {
      const _IsAlive = (c) => {
        const h = c.entity.GetComponent('HealthComponent');
        if (!h) {
          return true;
        }
        return h._health > 0;
      };

      const grid = this.GetComponent('SpatialGridController');
      const nearby = grid.FindNearbyEntities(5).filter(e => _IsAlive(e));
      const collisions = [];

      for (let i = 0; i < nearby.length; ++i) {
        const e = nearby[i].entity;
        const d = ((pos.x - e._position.x) ** 2 + (pos.z - e._position.z) ** 2) ** 0.5;

        // HARDCODED
        if (d <= 4) {
          collisions.push(nearby[i].entity);
        }
      }
      return collisions;
    }

    Update(timeInSeconds) {
      if (!this._stateMachine._currentState) {
        return;
      }

      const input = this.GetComponent('BasicCharacterControllerInput');
      this._stateMachine.Update(timeInSeconds, input);

      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }

      // HARDCODED
      if (this._stateMachine._currentState._action) {
        this.Broadcast({
          topic: 'player.action',
          action: this._stateMachine._currentState.Name,
          time: this._stateMachine._currentState._action.time,
        });
      }

      const currentState = this._stateMachine._currentState;
      if (currentState.Name != 'walk' &&
          currentState.Name != 'run' &&
          currentState.Name != 'dance' &&
          currentState.Name != 'hover' &&
          currentState.Name != 'idle') {
        return;
      }
    
      const velocity = this._velocity;
      const Vvelocity = this._velocity;
      const frameDecceleration = new THREE.Vector3(
          velocity.x * this._decceleration.x,
          velocity.y * this._decceleration.y,
          velocity.z * this._decceleration.z
      );
      frameDecceleration.multiplyScalar(timeInSeconds);
      frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
          Math.abs(frameDecceleration.z), Math.abs(velocity.z));
  
      velocity.add(frameDecceleration);
      Vvelocity.add(frameDecceleration);
  
      const controlObject = this._target;
      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3();
      const _R = controlObject.quaternion.clone();
  
      const acc = new THREE.Vector3(1, 0.125, this.GetComponent('HealthComponent')._params.benchpress)
      // const acc = this._acceleration.clone();
      // console.log(this.GetComponent('HealthComponent')._params.benchpress)
      // const acc = this._acceleration.clone();
      // this._acceleration = new THREE.Vector3(1, 0.125, 65.0);


      // if (input._keys.control) {
      //   this.audioManager.walk.current.playbackRate = 0
      //   acc.multiplyScalar(6.0);
      // } else {
        let accMultiplier = 1  
        if (input._keys.shift) {
          if (this.canFly)
          {
            acc.multiplyScalar(2);
            this.audioManager.walk.current.playbackRate = 0
          } else {
            this.audioManager.walk.current.playbackRate = 1.8
          }
          acc.multiplyScalar(3);
          
          // this.audioManager.walk.current.playbackRate.value = 2;
        } else {
          if (this.canFly)
          {
            acc.multiplyScalar(3);
            this.audioManager.walk.current.playbackRate = 1.8
          } else {
            this.audioManager.walk.current.playbackRate = 0.9
          }
        }
      // }
  
      if (input._keys.forward) {
          if (this.canFly)
          {
            if (input._keys.shift) 
            {
              Vvelocity.y -= acc.z * timeInSeconds / 3
            }
          }
        if (this.audioManager.walk.current.paused)
        {
          this.audioManager.walk.current.play()
        }
        accMultiplier = 0.5
        velocity.z += acc.z * timeInSeconds;
      } else {
        accMultiplier = 2
      }
      if (input._keys.backward) {
          if (this.canFly)
          {
            if (input._keys.shift) 
            {
              Vvelocity.y += acc.z * timeInSeconds
            }
          }
        velocity.z -= acc.z * timeInSeconds;
      }
      if (input._keys.left) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._sideAcceleration.y * accMultiplier);
        _R.multiply(_Q);
      }
      if (input._keys.right) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._sideAcceleration.y * accMultiplier);
        _R.multiply(_Q);
      }
  
      controlObject.quaternion.copy(_R);
  
      const oldPosition = new THREE.Vector3();
      oldPosition.copy(controlObject.position);
  
      const upward = new THREE.Vector3(0, 1, 0);
      upward.applyQuaternion(controlObject.quaternion);
      upward.normalize();
  
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();
  
      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();
  
      sideways.multiplyScalar(velocity.x * timeInSeconds);
      forward.multiplyScalar(velocity.z * timeInSeconds);
      upward.multiplyScalar(Vvelocity.y * timeInSeconds / 100);
  
      const pos = controlObject.position.clone();
      if (pos.y >= 0)
      {
        pos.add(upward);
      }
      pos.add(forward);
      pos.add(sideways);

      const collisions = this._FindIntersections(pos);



      // ONLY WOOD PLATFORM
      // if (pos.z < -16 || pos.z > 64)
      // {
      //   return
      // }
      // if (pos.x < -16 || pos.x > 16)
      // {
      //   if (pos.z < 22 || pos.z > 35)
      //   {
      //     return
      //   }
      // }

      for (var i = 0; i < this.boundaries.length; i++)
      {
        // console.log(pos, this.boundaries[i].z, pos.z > this.boundaries[i].z[0], pos.z < this.boundaries[i].z[1])
        if (pos.x > this.boundaries[i].x[0] && pos.x < this.boundaries[i].x[0] + this.boundaries[i].x[1])
        {
          // console.log("invalid pos", pos)
          // return
          if (pos.z > this.boundaries[i].z[0] && pos.z < this.boundaries[i].z[0] + this.boundaries[i].z[1])
          {
            // console.log("invalid pos", pos)
            return
          }
        }
      }

      // ONLY CENTER WOOD PLATFORM
      // if (pos.x < -1350 || pos.x > 1350)
      // {
      //   return
      // }
      // if (pos.z < -16 || pos.z > 64)
      // {
      //   return
      // }
      // if (pos.x < -916 || pos.x > 916)
      // {
      //   if (pos.z < 22 || pos.z > 35)
      //   {
      //     return
      //   }
      // }
      

      // if (pos.z < -16 || pos.z > 64) {
      // {
      //   return
      // }
      if (collisions.length > 0) {
        console.log(collisions[0]._name)

        return;
      }

      controlObject.position.copy(pos);
      this._position.copy(pos);
  
      this._parent.SetPosition(this._position);
      this._parent.SetQuaternion(this._target.quaternion);
    }
  };
  
  return {
      BasicCharacterControllerProxy: BasicCharacterControllerProxy,
      BasicCharacterController: BasicCharacterController,
  };

})();