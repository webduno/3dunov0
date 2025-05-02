import {entity} from "./entity.js";
import { ethers, Contract } from "./lib/ethers.js";

// import Token            from './abi/Token.json';
import {Roulette}         from './abi/Roulette.js';
import {ZooIslands}         from './abi/ZooIslands.js';

// import { ethers } from "https://cdn.ethers.io/lib/ethers-5.1.esm.min.js";

export const quest_component = (() => {

  const _TITLE = 'Welcome Adventurer!';
  const _TEXT = `Welcome to Honeywood adventurer, I see you're the chosen one and also the dragon born and whatever else, you're going to save the world! Also bring the rings back to mordor and defeat the evil dragon, and all the other things. But first, I must test you with some meaningless bullshit tasks that every rpg makes you do to waste time. Go kill like uh 30 ghosts and collect their eyeballs or something. Also go get my drycleaning and pick up my kids from daycare.`;
  const QUEST_LIST = {
    "EnableWallet": {
      id: "EnableWallet",
      persistent: true,
      completed: false,
      title: "Welcome to the Zoo Islands",
      text: `<h2>Connect your wallet to start playing</h2> \n\n
              <br/><b>Quest:</b>
              <br/><span class="text-lg">Give life to your Pets!</span>
              <br/><span class="text-sm">Your Pet's Statue leaves traces of life in your island every time you pet it</span>
              <br/><span class="text-sm">Hint: Every Pet has a Petting timeout, take good care and attention to it</span>
              <br/>
              <br/><br/>
              Important Information:
              <br/><a target="_blank" href="https://t.me/openpetworld">Telegram Group</a>
              <br/><a target="_blank" href="https://t.me/openpetworld">Guide</a>
              <br/>
              <br/><a href="https://webduno.com/opet/world.matic/">Go back to the Zoo</a>
              <br/><span>You read this message again in your Quest Journal (Book Icon)</span>
              <br/><br/>
              `,
    },
    "PetRoulette": {
      id: "PetRoulette",
      persistent: false,
      completed: false,
      title: "Play the Pet Roulette",
      text: "",
    },
    "ClickThePet": {
      id: "ClickThePet",
      persistent: false,
      completed: false,
      title: "Petting your Pet",
      text: "",
    },
    "Helpp": {
      id: "Helpp",
      persistent: true,
      completed: false,
      title: "Find life from deciphering the coins in your Zoo Island",
      text: "Stand directly in front of the coins and crouch down to decypher a message from your pet",
    },
    "Companion": {
      id: "Companion",
      persistent: true,
      completed: false,
      title: "Add a companion to decypher life with for extra rewards",
      text: "Add an Open Pet Companion in the Config Window, you will receive extra rewards in your Open Pet Companion only in the special coin, there is only 1 per Petting",
    },
  }

  class QuestComponent extends entity.Component {
    constructor(params) {
      super();
      this.zooIslandsAddress = ZooIslands.address
      this._id = params.id;
      this.zooIslandsContract = {}
      this.callbacks = params.callbacks
      // this._title = params.title;
      // this._text = params.text;
      // this._params = params;

      const e = document.getElementById('quest-ui');
      // const r = document.getElementById('roulette-ui');
      e.style.visibility = 'hidden';
      // r.style.visibility = 'hidden';
    }

    InitComponent() {
      this._RegisterHandler('input.picked', (m) => this._OnPicked(m));
    }

    _OnPicked(msg) {
      // alert(msg)
      // const quest = {
      //   id: 'foo',
      //   title: _TITLE,
      //   text: _TEXT,
      // };
      const quest = QUEST_LIST[this._id];


      const ui = this.FindEntity('ui').GetComponent('UIController');
      if (ui._quests[this._id] === undefined)
      {
        // console.log("this.callbacks[0]()")
        this.callbacks[0]()
        if (quest === undefined) return
        if (quest.persistent)
        {
          this._AddQuestToJournal(quest);
        }
      } else {
        // console.log("this.callbacks[1]()")
        this.callbacks[1]()
        // const ui = this.FindEntity('ui').GetComponent('UIController');
        // ui._OnQuestSelected(this._id)
      }
    }

    _AddQuestToJournal(quest) {
      const ui = this.FindEntity('ui').GetComponent('UIController');
      ui.AddQuest(quest);
    }
  };

  return {
      QuestComponent: QuestComponent,
  };
})();


            // if(window.ethereum)
            // {
            //   let metamaskEnableResult = await window.ethereum.enable().catch((error) => {})
            //   if (metamaskEnableResult === undefined)
            //   {
            //       console.log("already enabled")
            //     this.askedWallet = false
            //     return
            //   }
            //     const provider = new ethers.providers.Web3Provider(window.ethereum);
            //     const signer = provider.getSigner();
            //     const rouletteContract = new Contract(
            //       this.rouletteAddress,
            //       Roulette.abi,
            //       signer
            //     );
            //     const petContract = new Contract(
            //       this.petAddress,
            //       Pet.abi,
            //       signer
            //     );
            //   // const contractResult = await getContractData()
            //   let masterAddress = await rouletteContract.masterAddress().catch( () => {} )
            //                                           // .then( (x)=>{console.log("then",x)} ).catch( catchError )

            //   let ethprovider; 
            //   let network; 
            //   let foundNetwork;

            //   if (!masterAddress)
            //   {
            //       ethprovider = new ethers.providers.Web3Provider(window.ethereum);
            //       network = await ethprovider.getNetwork();
            //       console.log("ethprovider, network")
            //       console.log(ethprovider)
            //       console.log(network)
            //       alert("Invalid network detected. \n Please read the instructions to enter the app.")
            //       Store.state.invalidNetwork = foundNetwork+": "+network.chainId
            //     return
            //   }
            //   this.askedWallet = true
            //   this.walletIsConnected = true
            //   console.log("SUCCESS")
            //   // alert("SUCCESS")
              
            //   Store.state.mainAddress = ethers.utils.getAddress(metamaskEnableResult[0])
            //   Store.state.roulette = rouletteContract
            //   Store.state.roulette_address = Roulette.address
            //   // this.state.token = contractResult.token
            //   Store.state.pet = petContract