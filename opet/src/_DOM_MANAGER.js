export const DOM_MANAGER = (() => {
  class DOMManager {
    constructor() {
      this._inputList = {}
      this._inputNameList = []

      this._buttonList = {}
      this._buttonNameList = []

      let DOMScripts = document.querySelectorAll('[data-script]');
      for (var i = DOMScripts.length - 1; i >= 0; i--)
      {
        let scriptAction = DOMScripts[i].dataset.script.split(":")[0]

        if (scriptAction == "input")
        {
          let inputName = DOMScripts[i].dataset.script.split(":")[1].split("@")[0]
          let functionCallback = DOMScripts[i].dataset.script.split("@")[1]
          let parsedCallback = functionCallback.split("(")[0]
          this._inputList[inputName] = {element: DOMScripts[i], callback: null, value: ""}
          this._inputList[inputName].element.onkeyup = (m) => {
            switch(event.keyCode) {
              case 13: // w
                this[parsedCallback](m.target)
                break;
            }
          }
          this._inputNameList.push(inputName)
        }

        if (scriptAction == "button")
        {
          let buttonName = DOMScripts[i].dataset.script.split(":")[1].split("@")[0]
          let functionCallback = DOMScripts[i].dataset.script.split("@")[1]
          let parsedCallback = functionCallback.split("(")[0]
          this._buttonList[buttonName] = {element: DOMScripts[i], callback: null, value: ""}
          this._buttonList[buttonName].element.onclick = (m) => {
            // console.log(m)
            // m.target.className += " animate__bounce "
            
            // if (this.audioManager.ui.current.paused) { this.audioManager.ui.current.play() }
            this.AUDIO_MANAGER.playAudio("ui", "click1")
            this[parsedCallback](m)
          }
          this._buttonNameList.push(buttonName)
        }
      }
    }
    async getDOM(type, id)
    {
      switch (type)
      {
        case "input":
          return this._inputList[id]
        case "button":
          return this._buttonList[id]
      }
    }
  }
  
  return {
      DOMManager,
  };

})();