import {entity} from './entity.js';


export const ui_controller = (() => {

  class UIController extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._quests = {};
    }
  
    InitComponent() {
      this._iconBar = {
        stats: document.getElementById('icon-bar-stats'),
        inventory: document.getElementById('icon-bar-inventory'),
        quests: document.getElementById('icon-bar-quests'),
      };

      this._ui = {
        // inventoryClose: document.getElementById('stats-close'),
        // statsClose: document.getElementById('inventory-close'),
        // questsClose: document.getElementById('quests-close'),
        inventory: document.getElementById('inventory'),
        stats: document.getElementById('stats'),
        quests: document.getElementById('quest-journal'),
        questDismiss: document.getElementById('quest-dismiss'),
        rouletteDismiss: document.getElementById('roulette-dismiss'),
      };

      this._iconBar.inventory.onclick = (m) => { this._OnInventoryClicked(m); };
      // this._ui.inventoryClose.onclick = (m) => { this._OnInventoryClicked(m); };
      this._iconBar.stats.onclick = (m) => { this._OnStatsClicked(m); };
      // this._ui.statsClose.onclick = (m) => { this._OnStatsClicked(m); };
      this._iconBar.quests.onclick = (m) => { this._OnQuestsClicked(m); };
      // this._ui.questsClose.onclick = (m) => { this._OnQuestsClicked(m); };
      this._ui.questDismiss.onclick = (m) => { this._OnQuestDismissClicked(m); };
      this._ui.rouletteDismiss.onclick = (m) => { this._OnRouletteDismissClicked(m); };
      // this._HideUI();


      
      this._ui.inventory.style.visibility = 'hidden';
      // this._ui.stats.style.visibility = 'hidden';
      this._ui.quests.style.visibility = 'hidden';
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
        console.log(evt.currentTarget)
        let evtId = evt.currentTarget.id.replace("quest-entry-","")
        this._OnQuestSelected(evtId);
      };
      document.getElementById('quest-journal').appendChild(e);

      this._quests[quest.id] = quest;
      this._OnQuestSelected(quest.id);
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

    _HideUI() {
      this._ui.inventory.style.visibility = 'hidden';
      this._ui.stats.style.visibility = 'hidden';
      this._ui.quests.style.visibility = 'hidden';
    }

    _OnRouletteDismissClicked(msg) {
      msg.currentTarget.parentNode.parentNode.style.visibility = "hidden"
    }

    _OnQuestDismissClicked(msg) {
      msg.currentTarget.parentNode.parentNode.style.visibility = "hidden"
      // alert(msg)
      //   const e = document.getElementById('quest-ui');
      //   e.style.visibility = '';

      // const visibility = this._ui.quests.style.visibility;
      // this._HideUI();
      // this._ui.quests.style.visibility = (visibility ? '' : 'hidden');
    }
    
    _OnQuestsClicked(msg) {
      const visibility = this._ui.quests.style.visibility;
      this._HideUI();
      this._ui.quests.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnStatsClicked(msg) {
      const visibility = this._ui.stats.style.visibility;
      this._HideUI();
      this._ui.stats.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnInventoryClicked(msg) {
      const visibility = this._ui.inventory.style.visibility;
      this._HideUI();
      this._ui.inventory.style.visibility = (visibility ? '' : 'hidden');
    }

    Update(timeInSeconds) {
    }
  };

  return {
    UIController: UIController,
  };

})();