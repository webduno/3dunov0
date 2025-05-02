import * as THREE from './lib/three.js';
// import * as THREE from 'h t t p s://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import {SCENE_TEMPLATES} from './_SCENE_TEMPLATES.js'
import {AUDIO_MANAGER} from './_AUDIO_MANAGER.js'
import {DOM_MANAGER} from './_DOM_MANAGER.js'

import {third_person_camera} from './third-person-camera.js';
import {entity_manager} from './entity-manager.js';
import {player_entity} from './player-entity.js'
import {entity} from './entity.js';
import {gltf_component} from './gltf-component.js';
import {health_component} from './health-component.js';
import {player_input} from './player-input.js';

import {npc_entity} from './npc-entity-item.js';
// import {npc_entity} from './npc-entity-player.js';
// import {npc_entity} from './npc-entity.js';
// import {npc_entity} from './npc-entity-separate.js';

import {math} from './math.js';
import {spatial_hash_grid} from './spatial-hash-grid.js';
import {ui_controller} from './ui-controller.js';
import {health_bar} from './health-bar.js';
import {level_up_component} from './level-up-component.js';
import {quest_component} from './quest-component.js';
import {spatial_grid_controller} from './spatial-grid-controller.js';
import {inventory_controller} from './inventory-controller.js';
import {equip_weapon_component} from './equip-weapon-component.js';
import {attack_controller} from './attacker-controller.js';

import { ethers, Contract } from "./lib/ethers.js";
import {BigNumber} from "./lib/bignumber.js";

import {Roulette}         from './abi/Roulette.js';
import {Chat}         from './abi/Chat.js';
import {Pet}         from './abi/Pet.js';
import {Token}         from './abi/Token.js';
import {ZooIslands}         from './abi/ZooIslands.js';
import {CONSTANTS} from './lib/constants.js';
import {HELPERS} from './lib/helpers.js';

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



class OpenPetWorldIsland extends DOM_MANAGER.DOMManager {
  constructor()
  {
    super()
    this._Initialize();
  }

  async _Initialize()
  {
    await this.walletConnection()

    


    /************** VARIABLES INITIALIZATION **************/
    let params = new URLSearchParams(window.location.search)
    this.urlPetId = params.get("pet")
    this.flyEnabled = params.get("fly") === "true"
    this.liteVersion = params.get("lite") === "true"
    // alert("this.flyEnabled" + (this.flyEnabled ? "yes" : "no"))
    this.isLoaded =
    {
      landscape: false,
      terrain: false,
      terrainDetails: false,
    }
    this.blockchain = null
    this.corePetData =
    {
      isVisitorOwner: false
    }
    this.corePet =
    {
      number: null,
      life: null,
      inheritance: null,
      genes: null,
      id: null,
      pettedTimestampRaw: null,
      pettedTimestamp: null,
    }
    this.ranConnectAndPlay = false
    this.deathCounter = 0


    /************** FUNCTIONAL INITIALIZATION **************/
    this.AUDIO_MANAGER = new AUDIO_MANAGER.AudioManager()
    this._LoadThree_Scene_Camera_Light_Setup()
    // adds this ->
    //    _threejs
    //    _camera
    //    _scene
    //    _sun

    this._LoadEntityManager()
    // adds this ->
    //    _entityManager
    //    _grid

    this._LoadControllers();
    this._LoadBlockchainData();
    this._LoadPlayers();
    this._LoadButtons()

    if (!this.liteVersion)
    {
      this._LoadSky();
    }

    this.loadDOMScripts()

    this._previousRAF = null;
    this._RAF();
  }

  async connectAndPlay()
  {
    // this.audioManager.background.current.volume = .01
    // this.audioManager.background.current.play()
    // this.AUDIO_MANAGER.playAudio("background", "bg1")

    let thePet = this._entityManager.Get('notpet')
    if (thePet === undefined) return
    if (this.ranConnectAndPlay) return
    this.ranConnectAndPlay = true

    this.theinheritance = this.corePet.inheritance
    // console.log(document.getElementById("apet-worth"))
    document.getElementById("apet-worth").value = this.corePet.inheritance
    this.thepetnumber = this.corePet.number
    this.petslider.value = this.corePet.number
    this.calculateReturns()
    document.getElementById("JoyStick").className = document.getElementById("JoyStick").className.replace(" invisible ", "")

    this.DEBUG = {}

    this.addBoundaries()



    let colorLevelArray = [
                            {color: 0xFFFFFF, metalness: 0, roughness: 0.75},
                            {color: 0xFFFFFF, metalness: 0.35, roughness: 0.5},
                            {color: 0xFAD309, metalness: 0.25, roughness: 0.5},
                            {color: 0x09D3FA, metalness: 0.25, roughness: 0.5},
                          ]

    // console.log('notpet')
    // console.log(this._entityManager.Get('notpet'))
    this.enterNowUnix = parseInt(new Date().getTime()/1000)
    // console.log("this.corePet pettedTimestamp")
    this.petDueDate = this.corePet.pettedTimestamp + ( (CONSTANTS.pets[this.corePet.number].timeout * 60 * 60) / 10 )
    this.petOverDueDate = this.corePet.pettedTimestamp + ( (CONSTANTS.pets[this.corePet.number].timeout * 60 * 60) * 2 )
    // console.table({
    //   this.enterNowUnix,
    //   pettedTimestamp: this.corePet.pettedTimestamp,
    //   timeout: CONSTANTS.pets[this.corePet.number].timeout,
    //   this.petDueDate
    // })

    // this._entityManager.Get('helpp.button')._mesh.traverse(c => {{c.visible = true } })

    if (this.enterNowUnix > this.petDueDate)
    {
      this._entityManager.Get('pet.button')._mesh.traverse(c => {{c.visible = true } })
    }

    if (this.enterNowUnix > this.petOverDueDate)
    {
      this._entityManager.Get('overdue.button')._mesh.traverse(c => {
          // console.log("overdue.button", c.parent)
          // console.log("overdue.button parent type", c.parent.type)
        // if (c.parent.type == "Scene")
        // if (c instanceof THREE.MeshStandardMaterial)
        {
          c.visible = true
        }      
      })
    }

    this._entityManager.Get('notpet')._mesh.traverse(c => {
                            // console.log('child instanceof THREE.Mesh')
      if (c instanceof THREE.Mesh)
      {
        // console.log("this.corePet.inheritance")
        // console.log(this.corePet.inheritance)
        if (this.corePet.inheritance < 10**5)
        {
                    c.material = new THREE.MeshBasicMaterial({
                                                color: 0xAAAAAA,
                                                wireframe: true,
                                                transparent: true,
                                                opacity: 0.32,
                                                wireframeLinewidth: 1
                                            })
                    // console.log("eshStandardMaterial(colorLevelArray[0])")
        } else if (this.corePet.inheritance < 10**6)
        {
                    c.material = new THREE.MeshStandardMaterial(colorLevelArray[0])
                    // console.log("MeshStandardMaterial(colorLevelArray[1])")
        } else if (this.corePet.inheritance < 10**8)
        {
                    c.material = new THREE.MeshStandardMaterial(colorLevelArray[1])
                    // console.log("MeshStandardMaterial(colorLevelArray[1])")
        } else if (this.corePet.inheritance < 10**9)
        {
                    c.material = new THREE.MeshStandardMaterial(colorLevelArray[2])
                    // console.log("MeshStandardMaterial(colorLevelArray[2])")
        } else
        {
          if (this.corePet.inheritance == undefined)
          {
            c.material = new THREE.MeshBasicMaterial({
                                                color: 0xAAAAAA,
                                                wireframe: true,
                                                transparent: true,
                                                opacity: 0.2,
                                                wireframeLinewidth: 1
                                            })
            // console.log("MeshStandardMaterial(colorLevelArray[0])")
          } else {
            c.material = new THREE.MeshStandardMaterial(colorLevelArray[3])
            // console.log("MeshStandardMaterial(colorLevelArray[3])")
          }
        }
      }
    })


    document.getElementById('loading-container').style.display = "none"
    document.getElementById('container').style.visibility = "visible"


    document.getElementById('icon-bar-config').className += " animate__rollIn"

    document.getElementById('icon-bar-stats').className += " animate__bounceInUp"
    document.getElementById('icon-bar-quests').className += " animate__bounceInUp"
    document.getElementById('icon-bar-inventory').className += " animate__bounceInUp"

    document.getElementById('icon-bar-balances').className += " animate__jackInTheBox"



    this.finishLoading()
  }
  async finishLoading()
  {
      if (!this.isLoaded.terrainDetails)
      {
        this._LoadTerrainDetails()

        this.updatePets()
      }
  }

  calculatePetReturnMoney(e)
  {
    let theinheritance = e.value
    this.theinheritance = theinheritance
    this.calculateReturns()
  }
  calculateReturns()
  {

      this.petoutput.innerHTML = this.thepetnumber
      this.petdom.name.innerHTML = CONSTANTS.pets[this.thepetnumber].icon + " " + CONSTANTS.pets[this.thepetnumber].name
      this.petdom.multiplier.innerHTML = CONSTANTS.pets[this.thepetnumber].multiplier
      this.petdom.timeout.innerHTML = CONSTANTS.pets[this.thepetnumber].timeout
      let returnPerPetting = this.theinheritance /100000 * CONSTANTS.pets[this.thepetnumber].multiplier * 2
      let returnMonthly = returnPerPetting * 43200 / (CONSTANTS.pets[this.thepetnumber].timeout * 60 / 10)
      this.petdom.help.innerHTML = HELPERS.prettyNumberReduced(parseFloat(parseFloat(returnPerPetting / 37 / 2).toFixed(2)))
      this.petdom.perpet.innerHTML = HELPERS.prettyNumberReduced(parseFloat(parseFloat(returnPerPetting).toFixed(2)))
      this.petdom.return.innerHTML = HELPERS.prettyNumberReduced(parseFloat(parseFloat(returnMonthly).toFixed(2)))
      let dolarized = 1000 * returnMonthly / 69000000
      let worthdolarized = 1000 * this.theinheritance / 69000000
      this.petdom.money.innerHTML =  `$ ${HELPERS.prettyNumber(parseFloat(parseFloat(dolarized).toFixed(2)))}`
      this.petdom.worth.innerHTML =  `$ ${HELPERS.prettyNumber(parseFloat(parseFloat(worthdolarized).toFixed(2)))}`
  }
  toggleCalculator()
  {
    console.log("toggleCalculator")
  }
  async loadDOMScripts()
  {
    // this.DOM_MANAGER = DOM_MANAGER.DomManager()
    
    // DOM_MANAGER._inputList
    // DOM_MANAGER._inputNameList
    // DOM_MANAGER._buttonList
    // DOM_MANAGER._buttonNameList

    // this.inputList = DOM_MANAGER._inputList
    // this.inputNameList = DOM_MANAGER._inputNameList
    // this.buttonList = DOM_MANAGER._buttonList
    // this.buttonNameList = DOM_MANAGER._buttonNameList

    this.petdom = {
      name: document.getElementById("petName"),
      multiplier: document.getElementById("petMultiplier"),
      timeout: document.getElementById("petTimeout"),
      return: document.getElementById("petReturn"),
      help: document.getElementById("asdasdasd"),
      perpet: document.getElementById("petReturnPerPet"),
      money: document.getElementById("petReturnMoney"),
      worth: document.getElementById("petWorth"),
    }
    this.petslider = document.getElementById("petRange");
    this.petoutput = document.getElementById("petNumber");
    let slider = document.getElementById("myRange");
    this.volumeOutput = document.getElementById("demo");
    this.volumeOutput.innerHTML = slider.value; // Display the default slider value

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = (e) => {
      // console.log(e)
      this.volumeOutput.innerHTML = e.target.value
      try {
        this.AUDIO_MANAGER._audioManager.background.bg1.volume = e.target.value/100
      } catch (e) {
        console.log("asd")
        console.log("AUDIO_MANAGER._audioManager.background.bg1.volume } catch e { console.log(e) }", e) 
      }
      // this.audioManager.background.current.volume = 
    }
    this.petslider.oninput = (e) => {
      // console.log(e)
      this.thepetnumber = e.target.value
      this.calculateReturns()

      // this.audioManager.background.current.volume = e.target.value/100
    }
  }

  walletConnection()
  {
    return new Promise(async (resolve, reject) => 
    {
      let metamaskEnableResult
      if(window.ethereum)
      {
        window.ethereum.on('chainChanged', () => { window.location.reload(false) });
        window.ethereum.on('accountsChanged', () => { window.location.reload(false) });
        metamaskEnableResult = await window.ethereum.enable().catch((err) => {
          resolve(false)
        })
        resolve(true)
      } else {
        resolve(false)
        return this.NO_METAMASK()
      }
      if (metamaskEnableResult === undefined)
      {
        console.log("error?")
        resolve(false)
        return this.METAMASK_ERROR()
      }
    })
  }
  METAMASK_ERROR()
  {
    document.getElementById('loading-container').innerHTML = "Metamask error."
  }
  NO_METAMASK()
  {
    alert("You need the Metamask Extension to enter the Game")
    document.getElementById('main-button-container').innerHTML = "Download Metamask"
    document.getElementById('main-button-container').setAttribute('target', '_blank')
    document.getElementById('main-button-container').href = "https://metamask.io/download"
  }

  async WRONG_NETWORK()
  {
    document.getElementById("main-button-container").style.display = "none"
    document.getElementById("loading-content").style.display = "none"

    // alert("You need the Metamask Extension to enter the Game")
    // document.getElementById('main-button-container').innerHTML = "Download Metamask"
    // document.getElementById('main-button-container').setAttribute('target', '_blank')
    // document.getElementById('main-button-container').href = "h t t p s ://metamask.io/download"

    // return
    let ethprovider = new ethers.providers.Web3Provider(window.ethereum);
    let thenetwork = await ethprovider.getNetwork();
    console.log("ethprovider, network")
    console.log({ethprovider, thenetwork})
    // console.log(CONSTANTS.chainInfoReference)
    // console.log()
    let chainName = (CONSTANTS.chainInfo[ CONSTANTS.chainInfoReference["."+thenetwork.chainId] ])
    console.log("chainName,", chainName)

    // setTimeout(() => { alert("Cant connect to network, Switch Networks or Refresh") }, 100)
    let link;
    link = document.createElement("a")
    link.href = "https://chainlist.org"
    // link.href = "https://webduno..com/opet/#section-status"
    link.innerHTML = "or Change Network"
    link.className = "text-lg "
    link.setAttribute('target', '_blank')
    // document.getElementById("loading-container").prepend(document.createElement("br"))
    document.getElementById("loading-container").prepend(link)
    document.getElementById("loading-container").prepend(document.createElement("br"))
    let link2;
    link2 = document.createElement("a")
    link2.href = window.location.href
    link2.innerHTML = "Refresh"
    link2.className = "text-xxl block my-3"
    document.getElementById("loading-container").prepend(link2)

    let link4;
    link4 = document.createElement("p")
    link4.innerHTML = `Can't connect to blockchain <br/> Verify your connection or connect to the right Network`
    link4.className = "mb-6  opacity-50"
    document.getElementById("loading-container").prepend(link4)

    let link3;
    link3 = document.createElement("h1")
    link3.innerHTML = `Wallet currently connected <br/> to ${chainName.name}`
    link3.className = "text-xl mb-6  opacity-50"
    document.getElementById("loading-container").prepend(link3)

  }

  SHOW_PLAY()
  {
    document.getElementById("main-button-container").style.display = ""
    document.getElementById("loading-content").style.display = "none"
    document.getElementById("play-button").innerHTML = `<small>Enter</small> <br/> <b class="">Open Pet World</b> <br/> Island #${this.urlPetId}`
    document.body.addEventListener('keydown', (e) => {
      // console.log("asdasd")
    if (/*!e.target.classList.contains('')*/e.keyCode == "13") {
          this.connectAndPlay()
            // your code
        }
    });
  }

  NO_PET()
  {
    alert("Cant find the pet in the network. \n Please verify the URL and reload.")
    document.getElementById('loading-container').innerHTML = "Can't connect to network, verify the URL and reload."
  }

  async _LoadBlockchainData()
  {
    let blockchainData = await HELPERS.getContractData()
    let blockchainAccountData = await HELPERS.getAccountData(blockchainData.token, blockchainData.roulette)
    if (blockchainAccountData.account === undefined) return this.WRONG_NETWORK()

    try {
      const signer = blockchainAccountData.account.signer
      const signerAddress = blockchainAccountData.account.address

      let ownerOf = await blockchainData.pet.ownerOf(this.urlPetId).catch( () => {} )

      let ethprovider, network, foundNetwork;
      if (!ownerOf) return this.WRONG_NETWORK()

      this.blockchain =
      {
        ownerOf: ownerOf,
        zooIslandsContract:       blockchainData.zooIslands,
        chatContract:       blockchainData.chat,
        petContract:       blockchainData.pet,
        rouletteContract:       blockchainData.roulette,
        tokenContract:       blockchainData.token,
        signer,
        signerAddress,
      }

      let foundPetData = await blockchainData.pet.OpenPets(this.urlPetId);
      console.log("foundPetData")
      console.log(foundPetData)
      this.corePetData.isVisitorOwner = signerAddress == ownerOf
      this.corePet = Object.assign(this.corePet,{
        number: foundPetData.number,
        life: parseFloat(ethers.utils.formatEther(foundPetData.life)),
        inheritance: parseFloat(ethers.utils.formatEther(foundPetData.inheritance)),
        genes: HELPERS.shortAddress(foundPetData.genes),
        ownerOf: this.blockchain.ownerOf,
        ownerOfParsed: HELPERS.shortAddress(this.blockchain.ownerOf),
        id: parseInt(parseFloat(ethers.utils.formatEther(foundPetData.id))*(10**18)),
        pettedTimestampRaw: foundPetData.pettedTimestamp,
        pettedTimestamp: parseFloat(ethers.utils.formatEther(foundPetData.pettedTimestamp))*(10**18),
      })
      let petLife = await blockchainData.pet.getLifeList(this.urlPetId)
      this.petLifeList = petLife.map((amount) => ethers.utils.formatEther(amount))

      this.discoveredAmount = (this.petLifeList.filter((amount) => parseFloat(amount) > 0).length)

      if (this.discoveredAmount > 0)
      {
        // MISSION 1 PASSED
      }

      if (this.corePetData.isVisitorOwner)
      {
      }
     
      let foundPetNumber = foundPetData.number
      let foundPetName = CONSTANTS.petList[foundPetNumber]

      let notThePet = new entity.Entity();
      notThePet.AddComponent(new gltf_component.AnimatedModelComponent({
          scene: this._scene,
          resourcePath: 'https://webduno..com/opet/_resources/pets/fbx/',
          resourceName: foundPetName.toLowerCase()+'.fbx',
          scale: 3,
          visible: false,
          receiveShadow: true,
          castShadow: true,
      }));
      notThePet.AddComponent(new player_input.PickableComponent());
      notThePet.AddComponent(new quest_component.QuestComponent({
        id: "ClickThePet",
        callbacks: [
          () => {
            if (this._entityManager.Get('notpet')._mesh.visible)
            {
              console.log("clicked the pet model")
            } 
          },
          () => { alert("i will never reach here") },
        ],
      }));
      notThePet.SetPosition(new THREE.Vector3(0, 9.7, 118));
      this._entityManager.Add(notThePet, 'notpet');


      this.SHOW_PLAY()

      let registeredPets = await blockchainData.zooIslands.getRegisteredPets(signerAddress);
      let registeredPetsMapped = !registeredPets ? [] : registeredPets.map((item, index) => {
        return (item).toString()
      })
      this._LoadInventoryItems(registeredPetsMapped)
    } catch (e) {
      console.log(e,"ERROR CATCHED AFTER TRYING")
      this.WRONG_NETWORK()
    }
  }
  _LoadInventoryItems(items)
  {
    items.map(async (item, index) => {
      let isIndexHabitated = item != "0"
      // CHECKS IF THE SPOT IN THE REGISTERED PETS ARRAY IS HABITATED
      if (isIndexHabitated)
      {
        let foundPetName = CONSTANTS.petList[index]
        // console.log(index, foundPetName)
        // if (index == foundPetNumber)
        // {

        // }

        // let petOwner = await this.blockchain.pet.ownerOf(item).then().catch(() => {})

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
  }

  REFRESH_EVERYTHING()
  {
    window.location.reload(false)
  }

  async petThePet()
  {
    this.AUDIO_MANAGER.playAudio("ui", "click2")

    this.AUDIO_MANAGER.playAudio("tts", "petting")
    this.playSuccessModal("You are petting #"+this.urlPetId+"! <br/> Confirm this transaction in your wallet to save your progress ")

    // alert(this.urlPetId)
    let foundPet = await this.callContractMethodAsync(CONSTANTS.defaultNetwork, this.blockchain.petContract,
    "petAPet", [this.urlPetId],
    {
      callback: () => {
        console.log("petAPet callback")
        // this.audioManager.ui.click2.play()
        this.AUDIO_MANAGER.playAudio("ui", "click2")
        // this.REFRESH_EVERYTHING()
      },
      fallback: () => {
        console.log("petAPet fallback")
        // this.audioManager.ui.error1.play()
        this.AUDIO_MANAGER.playAudio("ui", "error1")
      },
    })
  }

  async sendMessage(element)
  {
    console.log("element")
    console.log(element)
    console.log(element.value)
    let args = element.value.split("|")
    // alert(this.urlPetId)
    let result = await this.callContractMethodAsync(
                              CONSTANTS.defaultNetwork,
                              this.blockchain.chatContract,
                              "sendMessage", [args[0], args[1], ethers.utils.solidityKeccak256([ "uint256" ], [ 0x2a ])],
                              {
                                callback: () => {console.log("sendMessage callback")},
                                fallback: () => {console.log("sendMessage fallback")},
                              })
    // console.log(foundPet)
  }

  async addContact(element)
  {

    console.log("element")
    console.log(element)
    console.log(element.value)

    // alert(this.urlPetId)
    let result = await this.callContractMethodAsync(
                              CONSTANTS.defaultNetwork,
                              this.blockchain.chatContract,
                              "addContact", [element.value],
                              {
                                callback: () => {console.log("callback")},
                                fallback: () => {console.log("fallback")},
                              })
    // console.log(foundPet)
  }

  async overduePetting(element)
  {
    let ownPetId = document.getElementById("ownpet-content").value
    if (ownPetId.length === 0)
    {

      this.AUDIO_MANAGER.playAudio("tts", "liquidateCompanion")
      this.playInfoToast("Are you sure you want to soft liquidate this pet? <br/> Add a Companion (Your own OpenPet ID) <br/> in the Configuration Window", 10000, "bottom")
       return
    } else {
      this.AUDIO_MANAGER.playAudio("tts", "liquidateContinue")
      this.playInfoToast("Are you sure you want to soft liquidate this pet? <br/> Confirm this transaction to continue", 10000, "bottom")
    }


    let parsedOwnPetId = ownPetId == "" ? 0 : ownPetId
    let result = await this.callContractMethodAsync(
                              CONSTANTS.defaultNetwork,
                              this.blockchain.petContract,
                              "overduePetting", [this.urlPetId, parsedOwnPetId],
                              {
                                callback: () => {
                                  console.log("callback")
                                },
                                fallback: () => {
                                  console.log("fallback")
                                },
                              })
  }

  async acceptContactRequest(element)
  {
    let inputName = element.dataset.script.split(":")[1].split("@")[0]
    let functionCallback = element.dataset.script.split("@")[1]
    let parsedCallback = functionCallback.split("(")[0]

    let result = await this.callContractMethodAsync(
                              CONSTANTS.defaultNetwork,
                              this.blockchain.chatContract,
                              "acceptContactRequest", [element.value],
                              {
                                callback: () => {console.log("callback")},
                                fallback: () => {console.log("fallback")},
                              })
  }


  async withdrawAllowance()
  {
    let addallowance = await this.callContractMethodAsync(
                              CONSTANTS.defaultNetwork,
                              this.blockchain.petContract,
                              "approve", [ZooIslands.address, this.urlPetId],
                              {
                                callback: async () => {
                                  console.log("addallowance callback", addallowance);
                                  // this.__life(spot)
                                },
                                fallback: () => {console.log("fallback")},
                              },true)
  }


  async withdrawLife(spot)
  {
    let themasteraddress = await this.blockchain.zooIslandsContract.getMasterAddress()
    console.log("themasteraddress", themasteraddress)
    let thefunds = await this.blockchain.zooIslandsContract.registeredFunds(themasteraddress)
    // let thefunds = await this.blockchain.zooIslandsContract.registeredFunds(themasteraddress,)
    console.log("thefunds", ethers.utils.formatEther(thefunds))

    console.log("[this.urlPetId, 1]", (this.theinheritance / 100 * 1))
    console.log([this.urlPetId, 1])


    let foundInheritanceLife = await this.callContractMethodAsync(
                              CONSTANTS.defaultNetwork,
                              this.blockchain.zooIslandsContract,
                              "registeredFunds", [themasteraddress],
                              {
                                callback: async () => {
                                  console.log("foundInheritanceLife callback", foundInheritanceLife);
                                  // this.__life(spot)
                                },
                                fallback: () => {console.log("fallback")},
                              },true)
    
    // console.log("redeemLife", [parseInt(this.urlPetId), 1],)
    let redeemLifeeded = await this.callContractMethodAsync(
                              CONSTANTS.defaultNetwork,
                              this.blockchain.zooIslandsContract,
                              "redeemLife", [this.urlPetId, 1],
                              {
                                callback: async () => {
                                  console.log("callback");
                                  this.__life(spot)
                                },
                                fallback: () => {console.log("fallback")},
                              },false)
  }
  

  async searchLife(spot)
  {
    this.playSuccessToast("You've found life!", 5000, "bottom")
    this.AUDIO_MANAGER.playAudio("coin", "coin1")

    let ownPetId = document.getElementById("ownpet-content").value
    let parsedOwnPetId = ownPetId.length === 0 ? 0 : ownPetId
    let foundLife = await this.callContractMethodAsync(
                              CONSTANTS.defaultNetwork,
                              this.blockchain.petContract,
                              "searchLife", [this.urlPetId, spot, parsedOwnPetId],
                              {
                                callback: async () => {
                                  console.log("callback");


                                  this.__life(spot)
                                },
                                fallback: () => {console.log("fallback")},
                              },false)


      const uiComponent = this._entityManager.Get('player').FindEntity('ui').GetComponent('UIController');
      // uiComponent.AddQuest(quest);
      // console.log("uiComponent._quests")
      // console.log(uiComponent._quests.Helpp)
      if (uiComponent._quests.Helpp != undefined)
      {
        if (uiComponent._quests.Helpp.completed)
        {
          this.AUDIO_MANAGER.playAudio("tts", "found")
        } else {
            uiComponent.RemoveQuest(uiComponent._quests.Helpp)
          // this.AUDIO_MANAGER.playAudio("tts", "foundAndSave").then(() => {
            // alert()
            this.AUDIO_MANAGER.playAudio("tts", "goodwork")
            this.playSuccessToast("You've found life! Quest Completed! <br/> Confirm this transaction to save your progress", 10000, "bottom")
          // })
        }
        uiComponent._quests.Helpp.completed = true

      } else {
        let petLife = await this.blockchain.petContract.getLifeList(this.urlPetId)
          let amount = (parseInt((parseFloat(ethers.utils.formatEther(petLife[spot])))))
        if (amount != 0)
        {
          this.AUDIO_MANAGER.playAudio("tts", "found")
          this.playSuccessToast(`You've received ${amount} Life! <br/> Life found in spot: ${spot} at OpenPet #${this.urlPetId}`, 5000, "bottom")
        }
      }

    // if (this.audioManager.coin.current.paused)
    // {
    //   this.audioManager.coin.current.play()
    //   // console.log(this.audioManager.coin.current)
    // }
    // console.log("deathCallback: "+e )
  }
  async updatePets()
  {
    const blockchain = this.blockchain;
    let foundPower = await this.blockchain.rouletteContract.registeredFunds(this.blockchain.signerAddress);
    let foundPet = await this.blockchain.petContract.OpenPets(this.urlPetId);
    // let foundPet = await this.blockchain.petContract._getLifeAt(this.urlPetId);

    this.corePet = Object.assign(this.corePet,{
      number: foundPet.number,
      life: parseFloat(ethers.utils.formatEther(foundPet.life)),
      power: parseFloat(ethers.utils.formatEther(foundPower)),
      inheritance: parseFloat(ethers.utils.formatEther(foundPet.inheritance)),
      // genes: parseInt(parseFloat(ethers.utils.formatEther(foundPet.genes))*(10**18)),
      id: parseInt(parseFloat(ethers.utils.formatEther(foundPet.id))*(10**18)),
      pettedTimestampRaw: foundPet.pettedTimestamp,
      pettedTimestamp: parseFloat(ethers.utils.formatEther(foundPet.pettedTimestamp))*(10**18),
    })

    this._entityManager.Get('player').GetComponent('HealthComponent').UpdateParams({
        updateUI: true,
        discovered: this.discoveredAmount,
        number: this.corePet.number,
        power: this.corePet.power,
        inheritance: this.corePet.inheritance,
        life: this.corePet.life,
        genes: this.corePet.genes,
        id: this.corePet.id,
        pettedTimestampRaw: this.corePet.pettedTimestampRaw,
        pettedTimestamp: this.corePet.pettedTimestamp,

        ownerOf: this.corePet.ownerOf,
        ownerOfParsed: this.corePet.ownerOfParsed,
      })

      this._entityManager.Get('notpet')._mesh.traverse(c => {
        // console.log("notpet ? ", c)
        c.visible = true;
        // c.position.y += 0.85;
      })

      this.__balance()
  }
  async __balance()
  {
    // console.log("________balance")
    let balance = await this.blockchain.tokenContract.balanceOf(this.blockchain.signerAddress);
    let parsedBalance = ethers.utils.formatEther(balance)

    const HealthComponent = this._entityManager.Get('player').GetComponent('HealthComponent');
    this._entityManager.Get('player').GetComponent('HealthComponent').UpdateParams({balance: HELPERS.prettyNumberReduced(parsedBalance)})
  }
  async __sendMessage()
  {
  }
  async __life(spot)
  {
    // console.log("__________life")

    const blockchain = this.blockchain;
    // console.log("blockchain")
    // console.log(blockchain)
    let foundPet = await this.blockchain.petContract.OpenPets(this.urlPetId);
    // let foundPet = await this.blockchain.petContract._getLifeAt(this.urlPetId);
    // console.log("foundPet")
    // console.log(foundPet)
    let method = "You Found "
    // let amount = HELPERS.prettyNumberReduced(parseFloat((parseFloat(ethers.utils.formatEther(petLife[spot])))))
    // HELPERS.prettyNumberReduced(parseFloat((parseFloat(ethers.utils.formatEther(foundPet.life)) - this.corePet.life).toFixed(2)))
    // let rate = "Life"
    // let icon = "./_resources/ui/sphere.png"
    // this.throwNotification(method+" ("+amount+" Life)", "@ #"+this.urlPetId+" | #"+spot)
    // this.playSuccessModal(`You've received ${amount} Life! <br/> Life found in spot: ${spot} at #${this.urlPetId}`)

      let petLife = await blockchainData.pet.getLifeList(this.urlPetId)
      this.petLifeList = petLife.map((amount) => ethers.utils.formatEther(amount))

      this.discoveredAmount = (this.petLifeList.filter((amount) => parseFloat(amount) > 0).length)
    

    this.corePet = Object.assign(this.corePet, {
      life: parseFloat(ethers.utils.formatEther(foundPet.life)),
      inheritance: parseFloat(ethers.utils.formatEther(foundPet.inheritance)),
      pettedTimestampRaw: foundPet.pettedTimestamp,
      pettedTimestamp: parseFloat(ethers.utils.formatEther(foundPet.pettedTimestamp))*(10**18),
    })

    this._entityManager.Get('player').GetComponent('HealthComponent').UpdateParams({
        updateUI: true,
        discovered: this.discoveredAmount,
        life: this.corePet.life,
        inheritance: this.corePet.inheritance,
        pettedTimestampRaw: this.corePet.pettedTimestampRaw,
        pettedTimestamp: this.corePet.pettedTimestamp,
      })

  }
  throwNotification(_title, _body)
  {
    // let icon = "./_resources/ui/sphere.png"
    Notification.requestPermission(function (permission) { if (permission === "granted") {
        // var notification = new Notification("Notifications Initiated!", {icon: "./_resources/ui/antenna.png"});
        var transaction = new Notification(_title, {body: _body, icon: icon});
        console.log("transaction", transaction)
        transaction.onclick = function () { window.focus(); };
    }});
  }
  stopMusic()
  {
    return alert("soon")
    // console.log(this.audioManager.background.current)
    if (this.audioManager.background.current.paused)
    {
      this.audioManager.background.current.play()
      document.getElementById("music.stop").className = document.getElementById("music.stop").className.replace(" neu-inset opacity-7 ", " ")
      document.getElementById("music.stop").className +=  " neu-flat opacity-50 "
    } else {
      this.audioManager.background.current.pause()
      document.getElementById("music.stop").className = document.getElementById("music.stop").className.replace(" neu-flat opacity-50 ", " ")
      document.getElementById("music.stop").className += " neu-inset opacity-7 "
    }
    // this.audioManager.background.current.stop()
  }
  reset()
  {
    let thePlayer = this._entityManager.Get('player')
    console.log(thePlayer.GetComponent("BasicCharacterController"))
    console.log(thePlayer.GetComponent("BasicCharacterController")._position.x = 0)
    console.log(thePlayer.GetComponent("BasicCharacterController")._position.y = 0)
    console.log(thePlayer.GetComponent("BasicCharacterController")._position.z = 0)

    console.log(thePlayer.GetComponent("BasicCharacterController")._parent)
    console.log(thePlayer.GetComponent("BasicCharacterController")._parent.SetPosition(new THREE.Vector3(0, 0, 0)))
    
    thePlayer.Broadcast({
        topic: 'update.position',
        value: new THREE.Vector3(0, 0, 0),
    });
    alert()
    alert()
  }
  _LoadPlayers()
  {
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

    const axe = new entity.Entity();
    axe.AddComponent(new inventory_controller.InventoryItem({
        type: 'weapon',
        damage: 3,
        renderParams: {
          name: 'Axe',
          scale: 0.25,
          icon: 'war-axe-64.png',
        },
    }));
    this._entityManager.Add(axe);

    const sword = new entity.Entity();
    sword.AddComponent(new inventory_controller.InventoryItem({
        type: 'weapon',
        damage: 3,
        renderParams: {
          name: 'Sword',
          scale: 0.25,
          icon: 'pointy-sword-64.png',
        },
    }));
    this._entityManager.Add(sword);
    this.boundaries = {}
    this.boundaryObjects = {}
    const player = new entity.Entity();
    player.AddComponent(new player_input.BasicCharacterControllerInput(params));
    if (this.flyEnabled)
    {
      player.AddComponent(new player_entity.BasicCharacterController(Object.assign(params, {fly: true})))
    } else {
      player.AddComponent(new player_entity.BasicCharacterController(params))
    }
    // player.AddComponent(new player_entity.BasicCharacterController(Object.assign(params, {boundaries: [
    //   { x: [50, 20], z: [-16, 80], visible: true },
    // ]})));

    player.AddComponent(
      new equip_weapon_component.EquipWeapon({anchor: 'RightHandIndex1'}));
    player.AddComponent(new inventory_controller.InventoryController(params));

    player.AddComponent(new health_component.HealthComponent({
        updateUI: true,
        health: 100,
        maxHealth: 100,
        strength: 45,
        power: 0,
        wisdomness: 5,
        benchpress: 85,
        curl: 100,
        experience: 0,
        level: 1,
        balance: 0,
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

  addBoundaries()
  {
    this.DEBUG.boundingBoxes = 
    {
      "bound.west.1": true,
      "bound.west.0": false,
      "bound.sign": false,
      "bound.altar": false,
      "bound.altar.bush.2": true,
      "bound.altar.bush.1": true,
      "bound.east.1": true,
      "bound.east.0": false,

      "bound.north.9": false,
      "bound.north.3": false,
      "bound.north.2": false,
      "bound.north.1": false,
      "bound.north.0": false,
      "bound.north.-1": false,
      "bound.north.-2": false,
      "bound.north.-3": false,
      "bound.north.-4": false,
      "bound.north.-5": false,

      "bound.south.5": false,
      "bound.south.4": false,
      "bound.south.0": false,
      "bound.south.1": false,
      "bound.south.-3": false,
      "bound.south.-2": false,
      "bound.south.-4": false,
      "bound.south.-7": false,
      "bound.south.-5": false,
    }

    // this.addBoundary(-1200, 800, -72, 160, 30, this.DEBUG.boundingBoxes["bound.west.1"], "bound.west.1", -14, 0xff0000) // * east trainstation placeholder
    this.addBoundary(-984, 30, -50, 200, 30, this.DEBUG.boundingBoxes["bound.west.0"], "bound.west.0", 0, 0x00FF00) // * east trainstation placeholder

    this.addBoundary(57.5, 45.1, 109.15, 10.9, 49, this.DEBUG.boundingBoxes["bound.sign"], "bound.sign", 11.8, 0xFF9933)
    this.addBoundary(-23, 45.1, 96, 50, 20, this.DEBUG.boundingBoxes["bound.altar"], "bound.altar", 0, 0xFF4411)
    // this.addBoundary(-60, 75, 136, 40, 20, this.DEBUG.boundingBoxes["bound.altar.bush.2"], "bound.altar.bush.2", 0, 0xFF4411)
    // this.addBoundary(-100, 10, 86, 12, 20, this.DEBUG.boundingBoxes["bound.altar.bush.1"], "bound.altar.bush.1", 0, 0xFF4411)

    this.addBoundary(977, 300, -100, 300, 30, this.DEBUG.boundingBoxes["bound.east.0"], "bound.east.0", 0, 0x00FF00) // * west 
    // this.addBoundary(300, 1000, -30, 170, 30, this.DEBUG.boundingBoxes["bound.east.1"], "bound.east.1", -14, 0xff0000) // * west 



    this.addBoundary(891, 298, -90, 67, 30, this.DEBUG.boundingBoxes["bound.north.9"], "bound.north.9", 0, 0x0000FF) // * north  *****************************
    this.addBoundary(707, 10, -40, 10, 40, this.DEBUG.boundingBoxes["bound.north.3"], "bound.north.3", 8, 0xFF9933) // * north House tree
    this.addBoundary(621, 15, -59, 15, 12, this.DEBUG.boundingBoxes["bound.north.2"], "bound.north.2", 0, 0xFF99aa) // * north House bush
    this.addBoundary(623, 310, -146, 67, 30, this.DEBUG.boundingBoxes["bound.north.1"], "bound.north.1", 0, 0x0000FF) // * north  ****************************

    this.addBoundary(-175, 825, -91, 67, 30, this.DEBUG.boundingBoxes["bound.north.0"], "bound.north.0", 0, 0x0000FF) // * north  ****************************

    this.addBoundary(-394, 480, -117, 67, 30, this.DEBUG.boundingBoxes["bound.north.-1"], "bound.north.-1", 0, 0x0000FF) // * north  ****************************
    this.addBoundary(-700, 470, -125, 57, 30, this.DEBUG.boundingBoxes["bound.north.-2"], "bound.north.-2", 0, 0x0000FF) // * north
    this.addBoundary(-950, 270, -112, 57, 30, this.DEBUG.boundingBoxes["bound.north.-3"], "bound.north.-3", 0, 0x0000FF) // * north
    this.addBoundary(-939, 100, -121, 97, 30, this.DEBUG.boundingBoxes["bound.north.-4"], "bound.north.-4", 0, 0x0000FF) // * north trainstation placeholder
    this.addBoundary(-1015, 100, -82, 97, 30, this.DEBUG.boundingBoxes["bound.north.-5"], "bound.north.-5", 0, 0x0000FF) // * north trainstation placeholder
    

    this.addBoundary(915, 90, 57, 90, 30, this.DEBUG.boundingBoxes["bound.south.5"], "bound.south.5", 0 , 0xFF0000) // * south
    this.addBoundary(236, 639, 133, 40, 30, this.DEBUG.boundingBoxes["bound.south.4"], "bound.south.4", 0, 0xFF0000) // * south museum placeholder
    this.addBoundary(614, 15, 75, 15, 40, this.DEBUG.boundingBoxes["bound.south.0"], "bound.south.0", 10, 0xFF99aa) // * south exchange bush
    this.addBoundary(776, 159, 82, 60, 30, this.DEBUG.boundingBoxes["bound.south.1"], "bound.south.1", 0 , 0xFF0000) // * south
    this.addBoundary(0, 400, 162, 40, 30, this.DEBUG.boundingBoxes["bound.south.-3"], "bound.south.-3", 0, 0xFF0000) // * south
    this.addBoundary(-101, 200, 134, 40, 30, this.DEBUG.boundingBoxes["bound.south.-2"], "bound.south.-2", 0, 0xFF0000) // * south
    this.addBoundary(-468, 382, 108, 40, 30, this.DEBUG.boundingBoxes["bound.south.-4"], "bound.south.-4", 0, 0xFF0000) // * south
    this.addBoundary(-942, 600, 81, 80, 30, this.DEBUG.boundingBoxes["bound.south.-7"], "bound.south.-7", 0 , 0xFF0000) // * south
    this.addBoundary(-1088, 174, 43, 113.5, 30, this.DEBUG.boundingBoxes["bound.south.-5"], "bound.south.-5", 0 , 0xFF0000) // * south trainstation placeholder
  }
  addBoundary(x, xSize, z, zSize, height = 2, visible = false, name = "", heightOffset = 0, color = 0xAAAAAA)
  {
    let plane;
    if (visible)
    {
      plane = new THREE.Mesh(new THREE.CubeGeometry(xSize-5,height,zSize-5), new THREE.MeshBasicMaterial({
                                                color,
                                                wireframe: true,
                                                transparent: true,
                                                opacity: 0.5,
                                                wireframeLinewidth: 2
                                            }) );
      plane.castShadow = false; plane.receiveShadow = true;
      // plane.rotation.x = -Math.PI / 2;
      plane.position.x = x + (xSize / 2)
      plane.position.z = z + (zSize / 2)
      // plane.position.x = 390
      plane.position.y += heightOffset
      this._scene.add(plane);
    }
    if (name != "")
    {
      this.boundaries[name] = this._entityManager.Get('player').GetComponent('BasicCharacterController').boundaries.length
      if (visible)
      {
        this.boundaryObjects[name] = plane
      }
    }
    this._entityManager.Get('player').GetComponent('BasicCharacterController').boundaries.push(
      { x: [x, xSize], z: [z, zSize], visible },
    )
  }

  _LoadSky()
  {
    // this._scene.fog = new THREE.FogExp2(0xFFFFFF, 0.002);
    this._scene.fog = new THREE.FogExp2(0xFDF9DB, 0.002);
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFFF, 0.6);
    // hemiLight.color.setHSL(0.6, 0, 0.6);
    // hemiLight.groundColor.setHSL(0.095, 0, 0.75);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    this._scene.add(hemiLight);

    const uniforms = {
      "topColor": { value: new THREE.Color(0xA3C9F2) },
      "bottomColor": { value: new THREE.Color(0xFDF9DB) },
      "offset": { value: 50 },
      "exponent": { value: 0.5 }
    };
    uniforms["topColor"].value.copy(hemiLight.color);
    // const _uniforms = {
    //   "topColor": { value: new THREE.Color(0xFFFFFF) },
    //   "bottomColor": { value: new THREE.Color(0xF9F9F9) },
    //   "offset": { value: 50 },
    //   "exponent": { value: 0.5 }
    // };
    // _uniforms["topColor"].value.copy(hemiLight.color);

    // this._scene.fog.color.copy(_uniforms["bottomColor"].value);
    this._scene.fog.color.copy(uniforms["bottomColor"].value);

    const skyGeo = new THREE.SphereBufferGeometry(2000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: _VS,
        fragmentShader: _FS,
        side: THREE.BackSide
    });
    // const _skyMat = new THREE.ShaderMaterial({
    //     uniforms: _uniforms,
    //     vertexShader: _VS,
    //     fragmentShader: _FS,
    //     side: THREE.BackSide
    // });

    // const sky = new THREE.Mesh(skyGeo, _skyMat);
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this._scene.add(sky);
  }
  _LoadClouds()
  {
    for (let i = 0; i < 30; ++i) {
      const index = math.rand_int(1, 3);
    const pos = new THREE.Vector3(
        (Math.random() * 2.0 - 1.0) * 1000,
        -40,
        (Math.random() * 2.0 - 1.0) * 1000);

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
  async playInfoToast(msg = "Hey!", timer = 10000, pos = "")
  {
    cuteToast({
      type: "info", // or 'info', 'error', 'warning'
      message: msg,
      timer,
      pos,
    })
  }
  async playSuccessToast(msg = "Hey!", timer = 10000, pos = "")
  {
    cuteToast({
      type: "success", // or 'info', 'error', 'warning'
      message: msg,
      timer,
      pos,
    })
  }
  async playSuccessModal(msg = "Hey!", title = "Confirm", timer = 10000)
  {
    cuteAlert({
      type: "success",
      title: title,
      message: msg,
      buttonText: "Okay",
    })
  }
  _LoadMobs()
  {
    this.MONSTER_COUNT = 37
    // console.log("load mobs")
    // console.log(this.petLifeList)
    for (let i = 0; i < this.MONSTER_COUNT; ++i) {
      if (this.petLifeList[i] !== "0.0")
      {
        // console.log(`not rendering ${i}`)
        continue
      }

      const monsters = [
        {
          resourceName: 'pawcoin.1.fbx',
          resourceTexture: 'Tree_Texture.png',
        },
        // {
        //   resourceName: 'Ghost.fbx',
        //   resourceTexture: 'Ghost_Texture.png',
        // },
        // {
        //   resourceName: 'Alien.fbx',
        //   resourceTexture: 'Alien_Texture.png',
        // },
      ];
      const m = monsters[math.rand_int(0, monsters.length - 1)];

      const npc = new entity.Entity();
      npc.AddComponent(new npc_entity.NPCController({
          camera: this._camera,
          scene: this._scene,
          resourceName: m.resourceName,
          resourceTexture: m.resourceTexture,
          resourcePath: 'https://webduno..com/opet/_resources/items/',
          // resourcePath: './resources/monsters/FBX/',
              npcId: i,
          deathCallback: (e) => {
            this.deathCounter++
            this.searchLife(e)
          }
      }));
      npc.AddComponent(
          new health_component.HealthComponent({
              health: 100,
              maxHealth: 100,
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
      npc.AddComponent(new attack_controller.AttackController({timing: 0.45}));
      let posx = (Math.random() * 1800 ) - 900
      let posy = (Math.random() * 80) - 20
      // if (posx <)
      npc.SetPosition(new THREE.Vector3(
                          posx,
                          0,
                          posy,
                        )
                      );
      this._entityManager.Add(npc);
    }
  }
  _LoadButtons()
  {


    let petButton = new entity.Entity();
    petButton.AddComponent(new gltf_component.AnimatedModelComponent({
        scene: this._scene,
        resourcePath: 'https://webduno..com/opet/_resources/fbx/islands/',
        resourceName: '/2.1.button.pet.fbx',
        scale: 1,
        visible: false,
        receiveShadow: true,
        castShadow: true,
    }));
    petButton.AddComponent(new player_input.PickableComponent());
    petButton.AddComponent(new quest_component.QuestComponent({
      id: "GiveLove",
      callbacks: [
        () => {
          if (this._entityManager.Get('pet.button')._mesh.visible)
          {
            this.petThePet()
          } 
        },
        () => { alert("i will never reach here") },
      ],
    }));
    // petButton.SetPosition(new THREE.Vector3(0, 9.7, 85));
    this._entityManager.Add(petButton, 'pet.button');



    let lifeButton = new entity.Entity();
    lifeButton.AddComponent(new gltf_component.AnimatedModelComponent({
        scene: this._scene,
        resourcePath: 'https://webduno..com/opet/_resources/fbx/islands/',
        resourceName: 'life.button.fbx',
        scale: 1,
        visible: false,
        receiveShadow: true,
        castShadow: true,
    }));
    lifeButton.AddComponent(new player_input.PickableComponent());
    lifeButton.AddComponent(new quest_component.QuestComponent({
      id: "GiveLife",
      callbacks: [
        () => {
          if (this._entityManager.Get('life.button')._mesh.visible)
          {
            alert("LIFE")
            // this.lifeThelife()
          } 
        },
        () => { alert("i will never reach here") },
      ],
    }));
    // lifeButton.SetPosition(new THREE.Vector3(0, 9.7, 85));
    this._entityManager.Add(lifeButton, 'life.button');



    let overdueButton = new entity.Entity();
    overdueButton.AddComponent(new gltf_component.AnimatedModelComponent({
        scene: this._scene,
        resourcePath: 'https://webduno..com/opet/_resources/fbx/islands/',
        resourceName: '2.2.button.overdue.fbx',
        scale: 1,
        visible: false,
        receiveShadow: true,
        castShadow: true,
    }));
    overdueButton.AddComponent(new player_input.PickableComponent());
    overdueButton.AddComponent(new quest_component.QuestComponent({
      id: "OverduePet",
      callbacks: [
        () => {
          if (this._entityManager.Get('overdue.button')._mesh.visible)
          {
            this.overduePetting()
          } 
        },
        () => { alert("i will never reach here") },
      ],
    }));
    // overdueButton.SetPosition(new THREE.Vector3(0, 9.7, 85));
    this._entityManager.Add(overdueButton, 'overdue.button');
  }
  _LoadGoals()
  {
    let platform
    let platform2

    platform = new entity.Entity();
    platform.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: 'https://webduno..com/opet/_resources/fbx/islands/',
        resourceName: 'goals.sign.fbx',
        scale: 1,
        receiveShadow: true,
        castShadow: true,
    }));
    // platform.SetPosition(new THREE.Vector3(0, 0, 0));
    this._entityManager.Add(platform);

    let helppButton = new entity.Entity();
    helppButton.AddComponent(new gltf_component.AnimatedModelComponent({
        scene: this._scene,
        resourcePath: 'https://webduno..com/opet/_resources/fbx/islands/',
        resourceName: 'goals.search.fbx',
        scale: 1,
        // visible: false,
        receiveShadow: true,
        castShadow: true,
    }));
    helppButton.AddComponent(new player_input.PickableComponent());
    helppButton.AddComponent(new quest_component.QuestComponent({
      id: "Helpp",
      callbacks: [
        () => {
          if (this._entityManager.Get('pet.button')._mesh.visible)
          {
            this.playSuccessToast("Hello! Can you help me pick up those coins?", 5000)
            this.AUDIO_MANAGER.playAudio("tts", "helpp")

            // this.AUDIO_MANAGER.playAudio("ui", "click2")
            // this.petThePet()
          } 
        },
        () => {
            const uiComponent = this._entityManager.Get('player').FindEntity('ui').GetComponent('UIController');
            // uiComponent.AddQuest(quest);
            // console.log("uiComponent._quests")
            // console.log(uiComponent._quests.Helpp)
            if (uiComponent._quests.Helpp != undefined)
            {
              if (!uiComponent._quests.Helpp.completed)
              {

                this.playSuccessToast("Hello! Can you help me pick up those coins?", 5000)
                this.AUDIO_MANAGER.playAudio("tts", "helpp")
              }
            }
        },
      ],
    }));
    // helppButton.SetPosition(new THREE.Vector3(0, 9.7, 85));
    this._entityManager.Add(helppButton, 'helpp.button');



  }

  checkPetNeed()
  {
    if (this.enterNowUnix > this.petDueDate)
    {
      // this._entityManager.Get('pet.button')._mesh.traverse(c => {{c.visible = true } })
      this.AUDIO_MANAGER.playAudio("tts", "petneed")
    }

    if (this.enterNowUnix > this.petOverDueDate)
    {
    }
  }

  _LoadTerrainDetails()
  {
    let platform
    platform = new entity.Entity();
    platform.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: 'https://webduno..com/opet/_resources/fbx/islands/',
        resourceName: "0.landscape.init.fbx",
        scale: 1,
        receiveShadow: true,
        castShadow: true,
    }));
    // platform.SetPosition(new THREE.Vector3(0, 10, 0));
    this._entityManager.Add(platform);

    let platform2
    this.modelsToLoad = {
      "1.altar.init": 0,
      // "2.1.button.pet": 1000,
      // "2.2.button.overdue": 2000,
      // "3.button.life": 3000,
      "5.landscape.islands.small": 5000,
      "6.1.foliage.init": 6000,
      "7.plots": 7000,
    }

    if (!this.liteVersion)
    {
      this.modelsToLoad["11.bridge"] = 11000
      this.modelsToLoad["10.landscape.rocks"] = 10000
      this.modelsToLoad["9.foliage.details"] = 9000
      this.modelsToLoad["8.landscape.islands.big"] = 8000
      this.modelsToLoad["6.2.altar.details"] = 6000
      this.modelsToLoad["4.landscape.details"] = 4000
    }



    this.modelsKeys = Object.keys(this.modelsToLoad)
    this.currentLoad = 0
    for (var i = 0; i < this.modelsKeys.length; i++)
    {
      // console.log(i, this.modelsKeys[i], this.modelsToLoad[this.modelsKeys[i]])
      setTimeout(() => {
        let j = this.currentLoad
        // console.log(this.modelsKeys[j], this.modelsToLoad[this.modelsKeys[j]])
        platform = new entity.Entity();
        platform.AddComponent(new gltf_component.StaticModelComponent({
            scene: this._scene,
            resourcePath: 'https://webduno..com/opet/_resources/fbx/islands/',
            resourceName: this.modelsKeys[j]+".fbx",
            scale: 1,
            receiveShadow: true,
            castShadow: true,
        }));
        // platform.SetPosition(new THREE.Vector3(0, 10, 0));
        this._entityManager.Add(platform);
        // console.log("adding", platform)
        this.currentLoad++
      }, (this.modelsToLoad[this.modelsKeys[i]] - 3000) * 2)
    }

    // this.AUDIO_MANAGER.playAudio("tts", "wait2")
    setTimeout(() => 
    {
      this._LoadMobs()
      this.checkPetNeed()
    }, 5000)

    setTimeout(() => 
    {
      this._LoadGoals();
    }, 10000)

    if (!this.liteVersion)
    {
      setTimeout(() => 
      {
        this._LoadClouds()
      }, 20000)
    }
  }

  async callContractMethodAsync(selectedNetwork, contract, methodName, args, _waitObject = {}, readOnly = true)
  {

    return new Promise(async (resolve, reject) => {
      _waitObject = Object.assign({
                    txUrl: CONSTANTS.chainInfo[selectedNetwork].params.blockExplorerUrls[0]+"/tx/",
                    success: -2,
                    title: "method: "+methodName,
                    subtitle: "args: "+args.join(" ,\n "),
                  }, _waitObject)
      // __waitObject(_waitObject)
      // __currentScreen("wait")
      let txReceipt = await contract[methodName].apply(this, args)
                                    .catch( error => {
                                      // __waitObject(Object.assign(_waitObject, {success: 0}))
                                      // __currentScreen("home")
                                      if (!_waitObject.muteCatch)
                                      {
                                        console.log("HELPERS.catchError")
                                        HELPERS.catchError(error)
                                      } else {
                                        console.log("muted catchhhhhhhhh")
                                      }
                                    } )
      if (txReceipt === undefined)
      {

        this._entityManager.Get('player').GetComponent('BasicCharacterControllerInput')._keys = 
        {forward: false, backward: false, left: false, right: false, space: false, shift: false, }
        _waitObject.fallback()
        // __waitObject(Object.assign(_waitObject, {title: _waitObject.title+" - Success!", success: 0}))
        resolve(txReceipt)
        return /* console.log("rejected transaction by user") */
      } else {

        this._entityManager.Get('player').GetComponent('BasicCharacterControllerInput')._keys = 
        {forward: false, backward: false, left: false, right: false, space: false, shift: false, }
        // __waitObject(Object.assign(_waitObject, {title: _waitObject.title+" . . .", success: -1, txUrl: _waitObject.txUrl+txReceipt.hash}))
        // console.log(txReceipt)
        if (!readOnly)
        {
          await txReceipt.wait(); /* console.log("@dev: txReceipt", txReceipt) */
        }
      }
        // __waitObject(Object.assign(_waitObject, {success: 1}))
        _waitObject.callback()
      // __currentScreen("home")
      resolve(txReceipt)
    });
  }

  moveBoundary(code)
  {
    let boundaryObjectName = code.value.split("@")[0]
    let codeData = code.value.split("@")[1]
    // console.log(boundaryObjectName, codeData)
    let axis = codeData.split(":")[0]
    let amount = codeData.split(":")[1]
    // console.log(this.boundaryObjects[boundaryObjectName])
    this.boundaryObjects[boundaryObjectName].position[axis] += parseInt(amount)
  }
  hideBoundary(boundaryObjectName)
  {
    // console.log("this._entityManager.Get('player').GetComponent('BasicCharacterController').boundaries")
    // console.log(boundaryObjectName)
    this.boundaryObjects[boundaryObjectName].traverse(c => {{c.visible = false } })
    // console.log(this.boundaryObjects[boundaryObjectName])
    // console.log(this._entityManager.Get('player').GetComponent('BasicCharacterController').boundaries)
    this._entityManager.Get('player').GetComponent('BasicCharacterController').boundaries.splice(this.boundaries[boundaryObjectName], 1)
    // console.log(this._entityManager.Get('player').GetComponent('BasicCharacterController').boundaries)
  }
  showBoundary(boundaryObjectName)
  {
    this.boundaryObjects[boundaryObjectName].traverse(c => {{c.visible = true } })
  }

  /************** SETTING FUNCTIONS **************/
  _LoadThree_Scene_Camera_Light_Setup()
  {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.gammaFactor = 1;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
    this._threejs.domElement.id = 'threejs';

    document.getElementById('container').appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);


    this.maxFov = 60
    this.fovslider = document.getElementById("fovRange");
    this.fovslider.oninput = (e) => {
      // console.log(e)
      this.theFovValue = e.target.value
      let isNeuFlat = e.target.value > 60 ? " neu-flat " : "" 
      document.getElementById("fovValue").innerHTML = `<span class='pa-1 ${isNeuFlat}'>${this.theFovValue}</span>`
      this.maxFov = this.theFovValue

      // this.audioManager.background.current.volume = e.target.value/100
    }

    // const aspect = 1920 / 1080;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 6000.0;
    this._camera = new THREE.PerspectiveCamera(this.maxFov, aspect, near, far);
    this._camera.position.set(500, 500, 500);

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xFFFFFF);


    this._sun = SCENE_TEMPLATES.getBasicLight()
    this._scene.add(this._sun);
  }
  _OnWindowResize()
  {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    // console.log(this._camera.aspect)
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _UpdateSun()
  {
    const player = this._entityManager.Get('player');
    const pos = player._position;

    this._sun.position.copy(pos);
    this._sun.position.add(new THREE.Vector3(250, 250, -250));
    this._sun.target.position.copy(pos);
    this._sun.updateMatrixWorld();
    this._sun.target.updateMatrixWorld();
  }

  _RAF()
  {
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

      if (this._entityManager.Get('player').GetComponent('BasicCharacterControllerInput')._keys.zoom) {
        // console.log("ZOOOOOOOOOOOOOOOOOOOOm", this._camera, this._offset)
        if (this._camera.fov > 30)
        {
          this._camera.fov -= 0.5
          this._camera.updateProjectionMatrix()
        }
        // this._offset = 1
      } else {
        if (this._camera.fov < this.maxFov)
        {
          this._camera.fov += 0.5
          this._camera.updateProjectionMatrix()
        }
      }

  }
  _LoadEntityManager()
  {
    this._entityManager = new entity_manager.EntityManager();
    this._grid = new spatial_hash_grid.SpatialHashGrid(
        [[-1000, -1000], [1000, 1000]], [100, 100]);

  }
  _LoadControllers() {
    const ui = new entity.Entity();
    ui.AddComponent(new ui_controller.UIController());
    this._entityManager.Add(ui, 'ui');
  }
    /******************************************/
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new OpenPetWorldIsland();
});

  // async join()
  // {
    
  //   this.blockchain.chatContract.on('messageSentEvent', (data, data2, data3, data4) =>
  //   {
  //     console.log("a message data has arriveddddddd (data, data2, data3, data4)")
  //     console.log(data, data2, data3, data4)
  //     document.getElementById("chat-content").innerHTML += `<span class='pa-1 neu-flat'>${data3}</span>`
  //     // alert(data)
  //   }, { filter: { to: this.blockchain.signerAddress }, /* fromBlock: 0, */ } )
  //   // alert(this.urlPetId)

  //       var publicKeyLeft = '0x' + this.blockchain.signerAddress.replace("0x","").substr(0, 20)
  //       var publicKeyRight = '0x' + this.blockchain.signerAddress.replace("0x","").substr(20,40)

  //   let result = await this.callContractMethodAsync(
  //                             CONSTANTS.defaultNetwork,
  //                             this.blockchain.chatContract,
  //                             "join", [publicKeyLeft, publicKeyRight],
  //                             {
  //                               callback: () => {console.log("join callback")},
  //                               fallback: () => {console.log("join fallback")},
  //                               muteCatch: true,
  //                             })
  //   // console.log(foundPet)
  // }
