(function() {
    //start of function
  var app = angular.module('ThisApp', []);

//actions layer
var ADD_ITEM = "ADD_ITEM";

app.factory("cartActions", function (dispatcher) {
  return {
    addItem(item) {
      dispatcher.emit({
        actionType: ADD_ITEM,
        item: item
      })
    }
  };
});//end actions layer
	
//dispatcher layer
class EventEmitter {
  constructor() {
    this.listeners = [];
  }

  emit(event) {
    this.listeners.forEach((listener) => {
      listener(event);
    });
  }

  addListener(listener) {
    this.listeners.push(listener);
    return this.listeners.length - 1;
  }
}// end define EventEmitter class

app.service("dispatcher", EventEmitter);
//end dispatcher layer
//store layer
class CartStore extends EventEmitter {
  constructor() {
    super();
    this.cartItems = [];
  }

  addItem(catalogItem) {
    var items = this.cartItems.filter((i) => i.catalogItem == catalogItem);
    if (items.length == 0) {
      this.cartItems.push({qty: 1, catalogItem: catalogItem});
    } else {
      items[0].qty += 1;
    }
  }

  removeItem(cartItem) {
    var index = this.cartItems.indexOf(cartItem);
    this.cartItems.splice(index, 1);
  }

  emitChange() {
    this.emit("change");
  }
}// end define CartStore class

m.factory("cartStore", function (dispatcher) {
  var cartStore = new CartStore();

  dispatcher.addListener(function (action) {
    switch(action.actionType){
      case ADD_ITEM:
        cartStore.addItem(action.item);
        cartStore.emitChange();
        break;

      case REMOVE_ITEM:
        cartStore.removeItem(action.item);
        cartStore.emitChange();
        break;
    }

  });

  //expose only the public interface
  return {
    addListener: (l) => cartStore.addListener(l),
    cartItems: () => cartStore.cartItems
  };
});//end store layer
	
//hardcoded data
app.value("catalogItems", [
  {id: 1, title: 'Item #1', cost: 1},
  {id: 2, title: 'Item #2', cost: 2},
  {id: 3, title: 'Item #3', cost: 3}
]);

//define CatalogCtrl class
class CatalogCtrl {
  constructor(catalogItems, cartActions) {
    this.cartActions = cartActions;
    this.catalogItems = catalogItems;
  }

  addToCart(catalogItem) {
    this.cartActions.addItem(catalogItem);
  }
}//end of define CatalogCtrl class
//end of define CartCtrl class
class CartCtrl {
  constructor(cartStore, cartActions) {
    this.cartStore = cartStore;;
    this.cartActions = cartActions;
    this.resetItems();

    cartStore.addListener(() => this.resetItems());
  }

  resetItems() {
    this.items = this.cartStore.cartItems();
  }

  removeItem(item) {
    //to be implemented
  }
}//end of define CatalogCtrl class
	
app.controller("CartCtrl", CartCtrl);		//create one controller of CartCtrl class
	
app.controller("CatalogCtrl", CatalogCtrl);	//create one controller of CatalogCtrl class

  //end of function
})();
