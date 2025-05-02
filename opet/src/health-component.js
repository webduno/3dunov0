import {entity} from "./entity.js";

import {HELPERS} from './lib/helpers.js';
import {CONSTANTS} from './lib/constants.js';

export const health_component = (() => {

  class HealthComponent extends entity.Component {
    constructor(params) {
      super();
      this._strength = params.strength;
      this._health = params.health;
      this._maxHealth = params.maxHealth;
      this._params = params;

      this.power = {}
      this.balance = {}
      this.number = {}
      this.inheritance = {}
      this.life = {}
      this.genes = {}
      this.id = {}
      this.pettedTimestamp = {}
      this.pettedTimestampRaw = {}

      this.audioManager = {}
      this.audioManager.player = {
        
        hit1: new Audio("./_resources/audio/collision/clamour3.wav"),
      }
      this.audioManager.player.current = this.audioManager.player["hit"+1]


    }

    InitComponent() {
      this._RegisterHandler('health.damage', (m) => this._OnDamage(m));
      this._RegisterHandler('health.add-experience', (m) => this._OnAddExperience(m));

      this._UpdateUI();
    }

    IsAlive() {
      return this._health > 0;
    }

    UpdateParams(newParams) {
      this._params = Object.assign({}, this._params, newParams);
      this._UpdateUI()
    }

    _UpdateUI() {
      if (!this._params.updateUI) {
        return;
      }

      const bar = document.getElementById('health-bar');

      const healthAsPercentage = this._health / this._maxHealth;
      bar.style.width = Math.floor(190 * healthAsPercentage) + 'px';

      const lifeBar = document.getElementById('stats-life-bar');
      const lifeAsPercentage = this._params.life * 1 / this._params.inheritance;
      const lifeAsPercentageMultiplied = this._params.life * 100 / this._params.inheritance;
      const leftoverPercentage = (lifeAsPercentageMultiplied * 100) - parseInt(lifeAsPercentageMultiplied) * 100
      console.log("lifeAsPercentage, lifeAsPercentageMultiplied, leftoverPercentage", lifeAsPercentage, lifeAsPercentageMultiplied, leftoverPercentage)
      lifeBar.style.width = Math.floor(200 * (leftoverPercentage / 100)) + 'px';


      // console.log(this._params)
      document.getElementById('stats-balance').innerHTML = this._params.balance == 0 ? "0" : this._params.balance ;

      document.getElementById('stats-strength').innerHTML = this._params.strength == 0 ? "0" : this._params.strength ;
      document.getElementById('stats-wisdomness').innerHTML = this._params.wisdomness == 0 ? "0" : this._params.wisdomness ;
      document.getElementById('stats-benchpress').innerHTML = this._params.benchpress == 0 ? "0" : this._params.benchpress ;
      document.getElementById('stats-curl').innerHTML = this._params.curl == 0 ? "0" : this._params.curl ;
      document.getElementById('stats-experience').innerHTML = this._params.experience == 0 ? "0" : this._params.experience ;
      if (this._params.number === undefined) return
      document.getElementById('stats-number').innerHTML = CONSTANTS.pets[this._params.number].icon+" "+CONSTANTS.petList[this._params.number] + "(" + this._params.number + ")"
      document.getElementById('stats-power').innerHTML = this._params.power == undefined ? '0' : HELPERS.prettyNumberReduced(this._params.power)
      document.getElementById('stats-inheritance').innerHTML = this._params.inheritance == undefined ? '0' : HELPERS.prettyNumberReduced(this._params.inheritance)
      document.getElementById('stats-life2').innerHTML = this._params.life == undefined ? '0' : HELPERS.prettyNumberReduced(parseFloat(this._params.life.toFixed(2)))
      document.getElementById('stats-discovered').innerHTML = this._params.life == undefined ? '0/37' : this._params.discovered+"/37"
      

      document.getElementById('stats-life').innerHTML = this._params.inheritance == undefined ? '0%' : parseFloat((this._params.life * 100)*100/(this._params.inheritance)).toFixed(2)+"%"
      document.getElementById('stats-genes').innerHTML = this._params.genes
      document.getElementById('stats-owner').innerHTML = this._params.ownerOfParsed == undefined ? "?" : this._params.ownerOfParsed
      
      document.getElementById('stats-id').innerHTML = this._params.id
      document.getElementById('stats-pettedTimestamp').innerHTML = this._params.pettedTimestamp == undefined ? "0" : HELPERS.getDate(this._params.pettedTimestamp, "medium")
    }

    _ComputeLevelXPRequirement() {
      const level = this._params.level;
      // Blah just something easy
      const xpRequired = Math.round(2 ** (level - 1) * 10);
      return xpRequired;
    }

    _OnAddExperience(msg) {
      this._params.experience += msg.value;
      const requiredExperience = this._ComputeLevelXPRequirement();
      if (this._params.experience < requiredExperience) {
        return;
      }

      this._params.level += 1;
      this._params.strength += 1;
      this._params.wisdomness += 1;
      this._params.benchpress += 1;
      this._params.curl += 2;

      const spawner = this.FindEntity(
          'level-up-spawner').GetComponent('LevelUpComponentSpawner');
      spawner.Spawn(this._parent._position);

      this.Broadcast({
          topic: 'health.levelGained',
          value: this._params.level,
      });

      this._UpdateUI();
    }

    _OnDeath(attacker) {
      if (attacker) {
        attacker.Broadcast({
            topic: 'health.add-experience',
            value: this._params.level * 100
        });
      }
      this.Broadcast({
          topic: 'health.death',
      });
    }

    _OnDamage(msg) {
      this._health = Math.max(0.0, this._health - msg.value);
      if (this._health == 0) {
        this._OnDeath(msg.attacker);
      }

      // console.log("asd")
      // if (this.audioManager.player.current.paused)
      // {
      //   this.audioManager.player.current.play()
      // }

      this.Broadcast({
        topic: 'health.update',
        health: this._health,
        maxHealth: this._maxHealth,
      });

      this._UpdateUI();
    }
  };

  return {
    HealthComponent: HealthComponent,
  };

})();