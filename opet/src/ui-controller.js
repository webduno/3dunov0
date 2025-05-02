import {entity} from './entity.js';


export const ui_controller = (() => {

  class UIController extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._quests = {};
    }
  
    InitComponent() {
      // this._HideUI();


      this.audioManager = {}
      this.audioManager.ui = {
        click1: new Audio("./_resources/audio/ticks/ticking clock - tick1.wav"),
      }
      this.audioManager.ui.current = this.audioManager.ui["click"+1]



      this.modalList = {}
      this.modalNameList = []
      let DOMScripts = document.querySelectorAll('[data-script]');
      for (var i = DOMScripts.length - 1; i >= 0; i--)
      {
        let scriptAction = DOMScripts[i].dataset.script.split(":")[0]

        if (scriptAction == "modal.selfclose")
        {
          DOMScripts[i].onclick = (m) =>
          {
            let grandParentContainer = m.currentTarget.parentNode.parentNode
            grandParentContainer.style.visibility = "hidden"
          }
        }

        if (scriptAction == "modal")
        {
          let modalName = DOMScripts[i].dataset.script.split(":")[1].split("@.")[0]
          let triggerClass = DOMScripts[i].dataset.script.split("@.")[1]
          this.modalList[modalName] = DOMScripts[i]
          this.modalList[modalName].style.visibility = "hidden"
          this.modalNameList.push(modalName)
          let DOMTriggers = document.getElementsByClassName(triggerClass)
          for (var j = 0; j < DOMTriggers.length; j++)
          {
            // console.log("DOMTRIGGER", DOMTriggers, i)
            DOMTriggers[j].onclick = (m) => {
              let theModalName = m.currentTarget.dataset.script
              if (this.modalList[theModalName].style.visibility == "hidden")
              {
                if (this.audioManager.ui.current.paused) { this.audioManager.ui.current.play() }
                this.modalList[theModalName].style.visibility = "visible"
                // this.modalList[theModalName].className += " animate__fadeIn "
              } else {
                // this.modalList[theModalName].className = this.modalList[theModalName].className.replace(" animate__fadeIn ","")
                if (this.audioManager.ui.current.paused) { this.audioManager.ui.current.play() }
                this.modalList[theModalName].style.visibility = "hidden"
              }
              this._HideAllBut(theModalName)
            }
          }
        }

      }
    }

    AddQuest(quest) {
      if (quest.id in this._quests) {
        return;
      }

      const e = document.createElement('DIV');
      e.className = 'quest-entry';
      e.id = 'quest-entry-' + quest.id;
      e.innerText = quest.title;
      e.onclick = (evt) => {
        let evtId = evt.currentTarget.id.replace("quest-entry-","")
        this._OnQuestSelected(evtId);
      };
      document.getElementById('quest-journal').appendChild(e);

      this._quests[quest.id] = quest;
      this._OnQuestSelected(quest.id);
    }

    RemoveQuest(quest) {
      if (!(quest.id in this._quests)) {
        return;
      }

      const e = document.getElementById('quest-entry-' + quest.id);
      const eParent = e.parentNode;
      eParent.removeChild(e)

      // this._quests[quest.id] = quest;
    }

    _OnQuestSelected(id) {
      const quest = this._quests[id];

      const e = document.getElementById('quest-ui');
      e.style.visibility = '';

      const text = document.getElementById('quest-text');
      text.innerHTML = quest.text;

      const title = document.getElementById('quest-text-title');
      title.innerHTML = quest.title;
    }

    _HideAllBut(modalName) {
      // CODE
      for (var i = 0; i < this.modalNameList.length; i++) {
        if (modalName == this.modalNameList[i]) continue
        this.modalList[this.modalNameList[i]].style.visibility = "hidden"
      }
    }

    Update(timeInSeconds) {
    }
  };

  return {
    UIController: UIController,
  };

})();