class ExampleCore {
    constructor(_params) {
    	
  	}
}

export const EXAMPLE = (() => {
  class Example extends ExampleCore {
    constructor(_params) {
      super()
      this._Init(_params);
    }
    _Init(_params) {
      console.log(_params)
    }
  }

  class Example2 {
    constructor(_params) {
      super()
      this._Init(_params);
    }
    _Init(_params) {
      console.log(_params)
    }
  }
  
  return {
      Example,
      Example2,
  };
})();