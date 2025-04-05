import {entity} from '../entity.js';


export const inventory_controller = (() => {

  class InventoryController extends entity.Component {
    constructor(params) {
      super();

      this._inventory = {};
      for (let i = 1; i <= 24; ++i) {
        this._inventory['inventory-' + i] = {
          type: 'inventory',
          value: null,
          id: null,
          petOwner: null,
        };
      }

      for (let i = 1; i <= 4; ++i) {
        this._inventory['inventory-equip-' + i] = {
          type: 'equip',
          value: null,
          id: null,
          petOwner: null,
        };
      }
    }

    InitComponent() {
      this._RegisterHandler('inventory.add', (m) => this._OnInventoryAdded(m));

      const _SetupElement = (n) => {
        const element = document.getElementById(n);
        element.ondragstart = (ev) => {
          ev.dataTransfer.setData('text/plain', n);
        };
        element.ondragover = (ev) => {
          ev.preventDefault();
        };
        element.ondrop = (ev) => {
          ev.preventDefault();
          const data = ev.dataTransfer.getData('text/plain');
          const otherDom = document.getElementById(data);
    
          this._OnItemDropped(otherDom, element);
        };
      }

      for (let k in this._inventory) {
        _SetupElement(k);
      }
    }

    _OnItemDropped(oldDomElement, newDomElement) {
      const oldItem = this._inventory[oldDomElement.id];
      const newItem = this._inventory[newDomElement.id];

      const oldValue = oldItem.value;
      const newValue = newItem.value;

      this._SetItemAtSlot(oldDomElement.id, newValue);
      this._SetItemAtSlot(newDomElement.id, oldValue);

      if (newItem.type == 'equip') {
        this.Broadcast({
          topic: 'inventory.equip',
          value: oldValue,
          id: newItem.id,
          added: false,
        });
      }
    }

    _SetItemAtSlot(slot, itemName) {
      const div = document.getElementById(slot);
      const obj = this.FindEntity(itemName);
      if (obj) {
        const item = obj.GetComponent('InventoryItem');
        const path = './resources/icons/weapons/' + item.RenderParams.icon;
        console.log("item")
        console.log(item)
        console.log(item.RenderParams)
        console.log(item.PetTokenId)
        div.href = "http://localhost/petisland/?pet="+item.PetTokenId
        // div.href = "http://localhost/petisland/?pet="+itemName.replace("pet-","").toLowerCase()
        div.style.backgroundImage = "url('" + path + "')";
        // div.href += "/"+item.id;
      } else {
        div.style.backgroundImage = '';
      }
      this._inventory[slot].value = itemName;
      this._inventory[slot].id = itemName;
    }

    _OnInventoryAdded(msg) {
      for (let k in this._inventory) {
        if (!this._inventory[k].value && this._inventory[k].type == 'inventory') {
          this._inventory[k].value = msg.value;
          msg.added = true;

          this._SetItemAtSlot(k, msg.value);
  
          break;
        }
      }
    }

    GetItemByName(name) {
      for (let k in this._inventory) {
        if (this._inventory[k].value == name) {
          return this.FindEntity(name);
        }
      }
      return null;
    }
  };


  class InventoryItem extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
    }

    InitComponent() {}

    get Params() {
      return this._params;
    }

    get RenderParams() {
      return this._params.renderParams;
    }

    get PetTokenId() {
      return this._params.id;
    }
  };

  
  return {
      InventoryController: InventoryController,
      InventoryItem: InventoryItem,
  };
})();