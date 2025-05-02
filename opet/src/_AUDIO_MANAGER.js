class AudioManagerCore {
    constructor(_params) {
    	
  	}
}
export const AUDIO_MANAGER = (() => {
  class AudioManager extends AudioManagerCore {
    constructor(_params = {}) {
      super()
      this._Init(_params);
  	}
    _Init(_params) {
    	// console.log("AUDIO_MANAGER_CORE _params")
    	// console.log(_params)
      this._audioManager = {}

      this._audioManager.tts = {
        found: new Audio("https://webduno..com/opet/_resources/audio/tts/found.ogg"),
        wait1: new Audio("https://webduno..com/opet/_resources/audio/tts/found and save.ogg"),
        wait2: new Audio("https://webduno..com/opet/_resources/audio/tts/wait 1.ogg"),
        petneed: new Audio("https://webduno..com/opet/_resources/audio/tts/petting need.ogg"),
        foundAndSave: new Audio("https://webduno..com/opet/_resources/audio/tts/found and save.1.ogg"),
        petting: new Audio("https://webduno..com/opet/_resources/audio/tts/petting continue.ogg"),
        helpp: new Audio("https://webduno..com/opet/_resources/audio/tts/helpp.ogg"),
        goodwork: new Audio("https://webduno..com/opet/_resources/audio/tts/good work.ogg"),
        liquidate: new Audio("https://webduno..com/opet/_resources/audio/tts/liquidate.ogg"),
        liquidateContinue: new Audio("https://webduno..com/opet/_resources/audio/tts/liquidate.ogg"),
        liquidateCompanion: new Audio("https://webduno..com/opet/_resources/audio/tts/liquidate companion.ogg"),

      }
      this._audioManager.ui = {
        click1: new Audio("https://webduno..com/opet/_resources/audio/interface/Menu Selection Click.wav"),
        click2: new Audio("https://webduno..com/opet/_resources/audio/jrpg/Purchase.wav"),
        click3: new Audio("https://webduno..com/opet/_resources/audio/action/message.wav"),
        click4: new Audio("https://webduno..com/opet/_resources/audio/ambience/weather/thunder_1_near.wav"),
        click5: new Audio("https://webduno..com/opet/_resources/audio/interface/UI_020.wav"),

        error1: new Audio("https://webduno..com/opet/_resources/audio/jrpg/Error.wav"),

      }
      this._audioManager.coin = {
        coin1: new Audio("https://webduno..com/opet/_resources/audio/down/gold_sack.wav"),
      }
      this._audioManager.background = {
        bg1: new Audio("https://webduno..com/opet/_resources/music/TownTheme.mp3"),
        bg2: new Audio("https://webduno..com/opet/_resources/music/AnotherMe.mp3"),
        bg3: new Audio("https://webduno..com/opet/_resources/music/WeightlessThoughts.mp3"),
        bg4: new Audio("https://webduno..com/opet/_resources/music/StoryTime.ogg"),

        // bg4: new Audio("https://webduno..com/opet/_resources/audio/Pluto.mp3"),
        // bg5: new Audio("https://webduno..com/opet/_resources/audio/OnTheBach.mp3"),
        current: null,
      }
    }
    async playAudio(group)
    {
     return 1 + parseInt(Math.random()*Object.keys(this._audioManager[group]).length - 1)
    }


    async playAudio(group, sound)
    {
      return new Promise(async (resolve, reject) => 
      {
        if (this._audioManager[group][sound].paused)
        {
          this._audioManager[group][sound].play()
          setTimeout(() => 
          {
            resolve(true)
          }, this._audioManager[group][sound].duration * 1.1 * 1000)
        } else {
          resolve(false)
        }
      })
    }
  }

  class BasicCharacterController {
    constructor(params) {
    }
  }
  
  return {
      AudioManager,
  };

})();