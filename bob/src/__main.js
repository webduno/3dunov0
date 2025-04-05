import { ethers, Contract }     from "./lib/ethers.js";
import {BigNumber}              from "./lib/bignumber.js";

// import Token                 from './abi/Token.json';
import {Roulette}               from './abi/Roulette.js';
import {Pet}                    from './abi/Pet.js';
import {Token}                  from './abi/Token.js';
import {Token2}                 from './abi/Token2.js';
import {ZooIslands}             from './abi/ZooIslands.js';
import {CONSTANTS}              from './lib/constants.js';
import {HELPERS}                from './lib/helpers.js';

import * as THREE               from './lib/three.js';
// import * as THREE            from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';
import {gltf_component}         from './gltf-component.js';

import {third_person_camera}    from './third-person-camera.js';
import {entity_manager}         from './entity-manager.js';
import {player_entity}          from './player-entity.js'
import {entity}                 from './entity.js';
import {health_component}       from './entity_classes/health-component.js';
import {health_bar}             from './entity_classes/health-bar.js';
import {inventory_controller}   from './entity_classes/inventory-controller.js';

import {player_input}           from './player-input.js';
import {npc_entity}             from './npc-entity.js';
import {math}                   from './math.js';
import {spatial_hash_grid}      from './spatial-hash-grid.js';
import {ui_controller}          from './ui-controller.js';
import {level_up_component}     from './level-up-component.js';
import {quest_component}        from './quest-component.js';
import {spatial_grid_controller}from './spatial-grid-controller.js';
import {equip_weapon_component} from './equip-weapon-component.js';
import {attack_controller}      from './attacker-controller.js';

const _VS = `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;


const _FS = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;

varying vec3 vWorldPosition;

void main() {
  float h = normalize( vWorldPosition + offset ).y;
  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
}`;



class HackNSlashDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    if(window.ethereum)
    {
      window.ethereum.on('chainChanged', () => { window.location.reload(false) });
      window.ethereum.on('accountsChanged', () => { window.location.reload(false) });
    }

    this.isLoaded = {
      terrain: false,
      mountains: false,
      terrainDetails: false,
    }



    this.MONSTER_COUNT = 2

    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.gammaFactor = 2.2;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
    this._threejs.domElement.id = 'threejs';

    document.getElementById('container').appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 60;
    // const aspect = 1920 / 1080;
    const aspect = window.innerWidth / window.innerHeight;

    const near = 1.0;
    const far = 10000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(500, 500, 500);

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xFFFFFF);

    let light = new THREE.DirectionalLight(0xFDF9DB, 1.0);
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
    this._scene.add(light);

    this._sun = light;

    

    this._entityManager = new entity_manager.EntityManager();
    this._grid = new spatial_hash_grid.SpatialHashGrid(
        [[-1000, -1000], [1000, 1000]], [100, 100]);

    this._LoadControllers();
    this._LoadPlayers();
    this._LoadPlaza();
    // this._LoadPlane();
    // this._LoadTerrain();
    this._LoadQuests()
    this._LoadRoulette()
    // this._LoadTerrainDetails();
    // this._LoadPets();
    // this._LoadZooPets();

    // this._LoadMobs();
    // this._LoadFoliage();
    // this._LoadClouds();
    // this._LoadSky();
    // this._LoadBasicSky();
    this._previousRAF = null;
    this._RAF();

    this.blockchain = null
  }

  _LoadControllers() {
    const ui = new entity.Entity();
    ui.AddComponent(new ui_controller.UIController());
    this._entityManager.Add(ui, 'ui');
  }
  _LoadBasicSky() {
    var ambientLight = new THREE.AmbientLight(0x888888);
    // Store.state.scene.add(ambientLight);
    this._scene.add(ambientLight);

  }
  _LoadSky() {
    this._scene.fog = new THREE.FogExp2(0x89b2eb, 0.002);
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFFF, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    this._scene.add(hemiLight);

    const uniforms = {
      "topColor": { value: new THREE.Color(0xA3C9F2) },
      "bottomColor": { value: new THREE.Color(0xF9F0AE) },
      "offset": { value: 50 },
      "exponent": { value: 0.5 }
    };
    uniforms["topColor"].value.copy(hemiLight.color);

    this._scene.fog.color.copy(uniforms["bottomColor"].value);

    const skyGeo = new THREE.SphereBufferGeometry(1000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: _VS,
        fragmentShader: _FS,
        side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this._scene.add(sky);
  }

  _LoadClouds() {
    for (let i = 0; i < 30; ++i) {
      const index = math.rand_int(1, 3);
    const pos = new THREE.Vector3(
        (Math.random() * 2.0 - 1.0) * 500,
        100,
        (Math.random() * 2.0 - 1.0) * 500);

      const e = new entity.Entity();
      e.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './resources/nature2/GLTF/',
        resourceName: 'Cloud' + index + '.glb',
        position: pos,
        scale: Math.random() * 5 + 10,
        emissive: new THREE.Color(0x808080),
      }));
      e.SetPosition(pos);
      this._entityManager.Add(e);
      e.SetActive(false);
    }
  }

  _LoadFoliage() {
    for (let i = 0; i < 100; ++i) {
      const names = [
          'CommonTree_Dead', 'CommonTree',
          'BirchTree', 'BirchTree_Dead',
          'Willow', 'Willow_Dead',
          'PineTree',
      ];
      const name = names[math.rand_int(0, names.length - 1)];
      const index = math.rand_int(1, 5);

      const pos = new THREE.Vector3(
          (Math.random() * 2.0 - 1.0) * 500,
          0,
          (Math.random() * 2.0 - 1.0) * 500);

      const e = new entity.Entity();
      e.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './resources/nature/FBX/',
        resourceName: name + '_' + index + '.fbx',
        scale: 0.25,
        emissive: new THREE.Color(0x000000),
        specular: new THREE.Color(0x000000),
        receiveShadow: true,
        castShadow: true,
      }));
      e.AddComponent(
          new spatial_grid_controller.SpatialGridController({grid: this._grid}));
      e.SetPosition(po);
      this._entityManager.Add(e);
      e.SetActive(false);
    }
  }

  _LoadMobs() {
    for (let i = 0; i < this.MONSTER_COUNT; ++i) {
      const monsters = [
        {
          resourceName: 'Ghost.fbx',
          resourceTexture: 'Ghost_Texture.png',
        },
        {
          resourceName: 'Alien.fbx',
          resourceTexture: 'Alien_Texture.png',
        },
        {
          resourceName: 'Skull.fbx',
          resourceTexture: 'Skull_Texture.png',
        },
        {
          resourceName: 'GreenDemon.fbx',
          resourceTexture: 'GreenDemon_Texture.png',
        },
        {
          resourceName: 'Cyclops.fbx',
          resourceTexture: 'Cyclops_Texture.png',
        },
        {
          resourceName: 'Cactus.fbx',
          resourceTexture: 'Cactus_Texture.png',
        },
      ];
      const m = monsters[math.rand_int(0, monsters.length - 1)];

      const npc = new entity.Entity();
      npc.AddComponent(new npc_entity.NPCController({
          camera: this._camera,
          scene: this._scene,
          resourceName: m.resourceName,
          resourceTexture: m.resourceTexture,
      }));
      npc.AddComponent(
          new health_component.HealthComponent({
              address: "0x00...",
              health: 50,
              maxHealth: 50,
              strength: 2,
              wisdomness: 2,
              benchpress: 3,
              curl: 1,
              experience: 0,
              level: 1,
              camera: this._camera,
              scene: this._scene,
          }));
      npc.AddComponent(
          new spatial_grid_controller.SpatialGridController({grid: this._grid}));
      npc.AddComponent(new health_bar.HealthBar({
          parent: this._scene,
          camera: this._camera,
      }));
      npc.AddComponent(new attack_controller.AttackController({timing: 0.35}));
      npc.SetPosition(new THREE.Vector3(
          (Math.random() * 2 - 1) * 50,
          0,
          (Math.random() * 2 - 1) * 50));
      this._entityManager.Add(npc);
    }
  }
  _LoadTerrainDetails() {



    let detail = new entity.Entity();
    detail.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'zoo foliage.fbx',
        // resourceAnimation: 'Standing Idle.fbx',
        scale: 1,
        receiveShadow: true,
        castShadow: true,
    }));
    detail.SetPosition(new THREE.Vector3(0, 0, 0));
    this._entityManager.Add(detail);

    const env = new entity.Entity();

    env.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'zoo build.v0.1.fbx',
        scale: 1,
        receiveShadow: true,
        castShadow: true,
    }));
    env.SetPosition(new THREE.Vector3(0, 0, 0));
    this._entityManager.Add(env);

    this.isLoaded.terrainDetails = true

  }
  _LoadMountains() {
    const mountains = new entity.Entity();
    mountains.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'zoo landscape.fbx',
        scale: 1,
        receiveShadow: true,
        castShadow: true,
    }));
    // this._entityManager.Add(mountains);


    this.isLoaded.mountains = true
  }
  _LoadPlane() {
    const plane = new THREE.Mesh(
        new THREE.CubeGeometry(201,201,5.5),
        new THREE.MeshStandardMaterial({
            color: 0xA3C9F2,
          }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.position.x = 90
    this._scene.add(plane);

    // let box = new THREE.Mesh(
    //     new THREE.CubeGeometry(200,1,30),
    //     new THREE.MeshStandardMaterial({
    //         color: 0xA3C9F2,
    //       }));
    // box.castShadow = false;
    // box.receiveShadow = true;
    // box.rotation.x = -Math.PI / 2;
    // box.position.x = 90
    // box.position.z = 104
    // this._scene.add(box);


    // const mountains = new entity.Entity();
    // mountains.AddComponent(new gltf_component.StaticModelComponent({
    //     scene: this._scene,
    //     resourcePath: './_resources/terrain/',
    //     resourceName: 'zoo mountains.fbx',
    //     scale: 1,
    //     // receiveShadow: true,
    //     // castShadow: true,
    // }));
    // mountains.SetPosition(new THREE.Vector3(0, 0, 0));
    // this._entityManager.Add(mountains);

  }
  _LoadPlaza() {



    const terrain = new entity.Entity();
    terrain.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'zoo plaza.fbx',
        scale: 1,
        receiveShadow: true,
        castShadow: true,
    }));
    terrain.SetPosition(new THREE.Vector3(0, 0, 0));
    this._entityManager.Add(terrain);
  }
  _LoadTerrain() {

    let detail = new entity.Entity();
    detail.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'zoo build.fbx',
        // resourceAnimation: 'Standing Idle.fbx',
        scale: 1,
        receiveShadow: true,
        castShadow: true,
    }));
    detail.SetPosition(new THREE.Vector3(0, 0, 0));
    this._entityManager.Add(detail);
  }
  _LoadQuests() {

    const signal = new entity.Entity();
    signal.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'zoo enableWallet.fbx',
        // resourceAnimation: 'Standing Idle.fbx',
        scale: 1,
        receiveShadow: true,
        castShadow: true,
    }));
    signal.AddComponent(new spatial_grid_controller.SpatialGridController({
        grid: this._grid,
    }));
    signal.SetPosition(new THREE.Vector3(40, 0, 0));
    this._entityManager.Add(signal);

    const bonsai = new entity.Entity();
    bonsai.AddComponent(new gltf_component.AnimatedModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'zoo tree.fbx',
        scale: 1,
        receiveShadow: true,
        castShadow: true,
    }));
    bonsai.AddComponent(new player_input.PickableComponent());
    bonsai.AddComponent(new quest_component.QuestComponent({
      id: "EnableWallet",
      callbacks: [
        () => { this.enableWallet() },
        () => { 
          this.updatePets()
        },
      ],
    }));
    this._entityManager.Add(bonsai);



  }
  _LoadRoulette() {
    

    const logoElement = new entity.Entity();
    logoElement.AddComponent(new gltf_component.AnimatedModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'zoo pet roulette.fbx',
        // resourceAnimation: 'Standing Idle.fbx',
        scale: 1,
        visible: false,
        receiveShadow: true,
        castShadow: true,
    }));
    logoElement.AddComponent(new player_input.PickableComponent());
    logoElement.AddComponent(new quest_component.QuestComponent({
      id: "PetRoulette",
      callbacks: [
        () => {
          // console.log("PetRoulette start")

        // console.log('roulette-ui:', document.getElementById('roulette-ui'))
        // console.log('roulette-iframe:', document.getElementById('roulette-iframe'))

            document.getElementById('roulette-ui').style.visibility = ''
            if (document.getElementById("roulette-iframe").src != CONSTANTS.defaultRouletteLink+CONSTANTS.chainInfo[CONSTANTS.defaultNetwork].endpoint)
            {
              document.getElementById("roulette-iframe").src = CONSTANTS.defaultRouletteLink+CONSTANTS.chainInfo[CONSTANTS.defaultNetwork].endpoint
              document.getElementById("roulette-text-title").href = CONSTANTS.defaultRouletteLink+CONSTANTS.chainInfo[CONSTANTS.defaultNetwork].endpoint
            }
         },
        () => { console.log("PetRoulette end") },
      ],
      // title: "PetRoulette",
      // text: "PetRoulette",
    }));
    // logoElement.SetPosition(new THREE.Vector3(0, 0, 0));
    this._entityManager.Add(logoElement, 'petroulette');



    const logoElementBuild = new entity.Entity();
    logoElementBuild.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'zoo pet roulette build.fbx',
        // resourceAnimation: 'Standing Idle.fbx',
        scale: 1,
        // visible: false,
        receiveShadow: true,
        castShadow: true,
    }));
    logoElementBuild.SetPosition(new THREE.Vector3(0, 0, 0));
    this._entityManager.Add(logoElementBuild, 'petroulette build');
  }

    async updatePets()
    {
      let registeredPets = await this.blockchain.zooIslandsContract.getRegisteredPets(this.blockchain.signerAddress);
      // GETS ARRAY OF IDS IN ZOO CONTRACT
      let registeredPetsMapped = !registeredPets ? [] : registeredPets.map((item, index) => {
        return (item).toString()
      })
      // GETS ARRAY OF PET TOKEN IDS IN STRING TYPE
      registeredPetsMapped.map(async (item, index) => {
        let isIndexHabitated = item != "0"
        // CHECKS IF THE SPOT IN THE REGISTERED PETS ARRAY IS HABITATED
        if (isIndexHabitated)
        {
          let foundPetName = CONSTANTS.petList[index]
          console.log(index, foundPetName)

          // let petOwner = await this.blockchain.petContract.ownerOf(item).then().catch(() => {})

          const foundPet = new entity.Entity();
          // CREATING IMAGE LINK ENTITTY TO ADD TO INVENTORY
          foundPet.AddComponent(new inventory_controller.InventoryItem({
              type: 'weapon',
              damage: 3,
              id: item,
              owner: "petOwner",
              renderParams: {
                name: foundPetName,
                scale: 0.25,
                icon: foundPetName.toLowerCase()+'.png',
              },
          }));
          // ONLY ADD PET IF IS NOT FOUND IN THE INVENTORY
          if (this._entityManager.Get('pet-'+foundPetName) == undefined)
          {
            this._entityManager.Add(foundPet, 'pet-'+foundPetName);

            this._entityManager.Get('player').Broadcast({
                topic: 'inventory.add',
                value: foundPet.Name,
                added: false,
            });
          }
        }
      })

      // IF PLAYER HAS ATLEATS 1 PET ITS ELEGIBLE TO SEE MOUNTAINS AND MORE DETAIL
      if (registeredPetsMapped.filter((item, index) => { return item != "0" }).length && !this.isLoaded.terrainDetails)
      {
        console.log("registeredPetsFiltered, this.isLoaded")
        this._LoadTerrainDetails()
      }
    }
    async updateInformation()
    {
      const TheHealthComponent = this._entityManager.Get('player').GetComponent('HealthComponent');
      TheHealthComponent.UpdateParams({address: HELPERS.shortAddress(this.blockchain.signerAddress)})

      let treat_balance = await this.blockchain.tokenContract.balanceOf(this.blockchain.signerAddress);
      let parsedBalance_treat = ethers.utils.formatEther(treat_balance)
      TheHealthComponent.UpdateParams({treat_balance: HELPERS.prettyNumberReduced(parsedBalance_treat)})

      let food_balance = await this.blockchain.token2Contract.balanceOf(this.blockchain.signerAddress);
      let parsedBalance_food = ethers.utils.formatEther(food_balance)
      TheHealthComponent.UpdateParams({food_balance: HELPERS.prettyNumberReduced(parsedBalance_food)})

      let pet_balance = await this.blockchain.token2Contract.balanceOf(this.blockchain.signerAddress);
      let parsedBalance = ethers.utils.formatEther(pet_balance)
      TheHealthComponent.UpdateParams({balance: HELPERS.prettyNumberReduced(parsedBalance)})
    }
    async enableWallet()
    {
      let metamaskEnableResult
      if(window.ethereum)
      {
        metamaskEnableResult = await window.ethereum.enable().catch((error) => {})
      }
      if (metamaskEnableResult === undefined)
      {
          console.log("already enabled")
        // this.askedWallet = false
        return
      }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        // console.log("consignertract")
        // console.log(signer)
        // console.log(signerAddress)
        // console.log("contract")
        const zooIslandsContract = new Contract(
          ZooIslands.address,
          ZooIslands.abi,
          signer
        );
        // console.log("token: "+Token.address)
        const petContract = new Contract(
          Pet.address,
          Pet.abi,
          signer
        );
        const tokenContract = new Contract(
          Token.address,
          Token.abi,
          signer
        );
        const token2Contract = new Contract(
          Token2.address,
          Token2.abi,
          signer
        );
        // console.log("ZooIslands.address")
        // console.log(ZooIslands.address)
        // console.log(zooIslandsContract)
        // this.zooIslandsContract = zooIslandsContract

        this.blockchain = {
          zooIslandsContract,
          petContract,
          tokenContract,
          token2Contract,
          signer,
          signerAddress,
        }
        
        // let registeredPets = await zooIslandsContract.getRegisteredPets().catch( () => {} )
        let registeredPets = await zooIslandsContract.OpenPet().catch( () => {} )

        let ethprovider; 
        let network; 
        let foundNetwork;

        // console.log("registeredPets result")
        // console.log(registeredPets)

        if (!registeredPets)
        {
            console.log("? token: "+Token.address)
            ethprovider = new ethers.providers.Web3Provider(window.ethereum);
            network = await ethprovider.getNetwork();
            console.log("ethprovider, network")
            console.log(ethprovider)
            console.log(network)
            alert("Can't connect to detected network. \n Please read the instructions to enter the app.")
            // Store.state.invalidNetwork = foundNetwork+": "+network.chainId
          return
        }


        // console.log("OpenPet")
        // console.log(registeredPets)
        if (!this.isLoaded.mountains)
        {
          // this._LoadTerrain();
          // this._LoadClouds();
          this._LoadSky();
          this._LoadMountains()
          // this._LoadTerrainDetails()
          this.updatePets()
          this.updateInformation()
          // console.log(this._entityManager.Get('petroulette').GetComponent('AnimatedModelComponent'))
          // this._entityManager.Get('petroulette')._mesh.visible = true
          this._entityManager.Get('petroulette')._mesh.traverse(c => {
            c.visible = true;
            // c.position.y += 0.85;
          })
          // this._entityManager.Get('petroulette build')._mesh.traverse(c => {
          //   c.visible = true;
          // })
          // this._ShowRoulette()
        }

        // let blockchain = new entity.Entity();
        // blockchain.AddComponent({
        //   registeredPets,
        // })

        // this._entityManager.Add(blockchain, 'blockchain');


        // this.zooIslandsContract = zooIslandsContract
    }

  _LoadPets() {
    const allPets = new entity.Entity();
    allPets.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'all.fbx',
        scale: 1,
        receiveShadow: true,
        castShadow: true,
    }));
    allPets.SetPosition(new THREE.Vector3(0, -0.75, 0));
    this._entityManager.Add(allPets);
  }

  _LoadZooPets() {
    const zooPets = new entity.Entity();
    zooPets.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './_resources/terrain/',
        resourceName: 'zoo pets center.fbx',
        scale: 1,
        receiveShadow: true,
        castShadow: true,
        visible: false,
    }));
    zooPets.SetPosition(new THREE.Vector3(0, -0.75, 0));
    // zooPets.SetActive(false);
    // console.log("zooPets")
    // console.log(zooPets)
    this._entityManager.Add(zooPets);

            let colorLevelArray = [
                        {color: 0xFFFFFF, metalness: 0, roughness: 0.75},
                        {color: 0xFFFFFF, metalness: 0.35, roughness: 0.5},
                        {color: 0xFAD309, metalness: 0.25, roughness: 0.5},
                        {color: 0x09D3FA, metalness: 0.25, roughness: 0.5},
                        ]


  }

        async showAllPets()
        {
            // if (this.walletIsConnected) return 
            // this.addStage()
            let colorLevelArray = [
                        {color: 0xFFFFFF, metalness: 0, roughness: 0.75},
                        {color: 0xFFFFFF, metalness: 0.35, roughness: 0.5},
                        {color: 0xFAD309, metalness: 0.25, roughness: 0.5},
                        {color: 0x09D3FA, metalness: 0.25, roughness: 0.5},
                        ]

            let owner = "0x00000000000"
            for (let i = 0; i < 37; i++) {
                  let newPet = {
                      owner,
                        id: 0,
                        number: i,
                        animal: _CONSTANTS.petList[i],
                        inheritance: 0,
                        uri: "",
                  }

                  // let foundPet = this.pets.filter((item, index) => {
                  //     return item.number == singlePet.number
                  // })

                  if (!false)
                  {
                      // Store.state.pets.push(newPet)
                      // this.addPet(newPet)
                  } else {
                      // if (newPet.inheritance > this.pets[this.pets.indexOf(foundPet[0])].inheritance)
                      // {
                      //     this.pets[this.pets.indexOf(foundPet[0])].inheritance = newPet.inheritance

                      //       if (newPet.inheritance > 0.1 * 10**6 && newPet.inheritance < 1 * 10**6)
                      //       {
                      //           Store.state.petModels[this._CONSTANTS.petList[singlePet.number]].traverse((child) => {
                      //               if (child instanceof THREE.Mesh){
                      //                   child.material = new THREE.MeshStandardMaterial(colorLevelArray[0])
                      //               }
                      //           });
                      //       } else if (newPet.inheritance < 100 * 10**6)
                      //       {
                      //           Store.state.petModels[this._CONSTANTS.petList[singlePet.number]].traverse((child) => {
                      //               if (child instanceof THREE.Mesh){
                      //                   child.material = new THREE.MeshStandardMaterial(colorLevelArray[1])
                      //               }
                      //           });
                      //       } else if (newPet.inheritance < 1000 * 10**6)
                      //       {
                      //           Store.state.petModels[this._CONSTANTS.petList[singlePet.number]].traverse((child) => {
                      //               if (child instanceof THREE.Mesh){
                      //                   child.material = new THREE.MeshStandardMaterial(colorLevelArray[2])
                      //               }
                      //           });
                      //       } else
                      //       {
                      //           object.traverse((child) => {
                      //               if (child instanceof THREE.Mesh){
                      //                   child.material = new THREE.MeshStandardMaterial(colorLevelArray[3])
                      //               }
                      //           });
                      //       }
                      // }
                  }

              }
        }

  _LoadPlayers() {
    const params = {
      camera: this._camera,
      scene: this._scene,
    };

    const levelUpSpawner = new entity.Entity();
    levelUpSpawner.AddComponent(new level_up_component.LevelUpComponentSpawner({
        camera: this._camera,
        scene: this._scene,
    }));
    this._entityManager.Add(levelUpSpawner, 'level-up-spawner');

    // const axe = new entity.Entity();
    // axe.AddComponent(new inventory_controller.InventoryItem({
    //     type: 'weapon',
    //     damage: 3,
    //     renderParams: {
    //       name: 'Axe',
    //       scale: 0.25,
    //       icon: 'war-axe-64.png',
    //     },
    // }));
    // this._entityManager.Add(axe);

    // const sword = new entity.Entity();
    // sword.AddComponent(new inventory_controller.InventoryItem({
    //     type: 'weapon',
    //     damage: 3,
    //     renderParams: {
    //       name: 'Sword',
    //       scale: 0.25,
    //       icon: 'pointy-sword-64.png',
    //     },
    // }));
    // this._entityManager.Add(sword);

    const player = new entity.Entity();
    player.AddComponent(new player_input.BasicCharacterControllerInput(params));
    player.AddComponent(new player_entity.BasicCharacterController(params));
    // player.AddComponent(
    //   new equip_weapon_component.EquipWeapon({anchor: 'RightHandIndex1'}));
    player.AddComponent(new inventory_controller.InventoryController(params));
    player.AddComponent(new health_component.HealthComponent({
        updateUI: true,
        health: 100,
        maxHealth: 100,
        strength: 0,
        wisdomness: 5,
        benchpress: 20,
        curl: 100,
        experience: 0,
        level: 1,
    }));
    player.AddComponent(
        new spatial_grid_controller.SpatialGridController({grid: this._grid}));
    // player.setPosition(new THREE.Vector3(0, 0, 0));
    player.AddComponent(new attack_controller.AttackController({timing: 0.7}));
    this._entityManager.Add(player, 'player');

    // player.Broadcast({
    //     topic: 'inventory.add',
    //     value: axe.Name,
    //     added: false,
    // });

    // player.Broadcast({
    //     topic: 'inventory.add',
    //     value: sword.Name,
    //     added: false,
    // });

    // player.Broadcast({
    //     topic: 'inventory.equip',
    //     value: sword.Name,
    //     added: false,
    // });

    const camera = new entity.Entity();
    camera.AddComponent(
        new third_person_camera.ThirdPersonCamera({
            camera: this._camera,
            target: this._entityManager.Get('player')}));
    this._entityManager.Add(camera, 'player-camera');
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    // console.log(this._camera.aspect)
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _UpdateSun() {
    const player = this._entityManager.Get('player');
    const pos = player._position;

    this._sun.position.copy(pos);
    this._sun.position.add(new THREE.Vector3(250, 250, -250));
    this._sun.target.position.copy(pos);
    this._sun.updateMatrixWorld();
    this._sun.target.updateMatrixWorld();
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this._UpdateSun();

    this._entityManager.Update(timeElapsedS);
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new HackNSlashDemo();
});
