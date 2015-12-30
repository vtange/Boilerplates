var m = angular.module('cart', []);

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
}



//-------------ACTIONS-------------

var ADD_ITEM = "ADD_ITEM";
var REMOVE_ITEM = "REMOVE_ITEM";

m.factory("cartActions", function (dispatcher) {
  return {
    addItem(item) {
      dispatcher.emit({
        actionType: ADD_ITEM,
        item: item
      })
    },

    removeItem(item) {
      dispatcher.emit({
        actionType: REMOVE_ITEM,
        item: item
      })
    }
  };
});



//-------------DISPATCHER-------------
m.service("dispatcher", EventEmitter);



//-------------STORE-------------

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
}

m.factory("cartStore", function (dispatcher) {
  var cartStore = new CartStore();

  dispatcher.addListener(function (action) {
    switch(action.actionType){
      case ADD_ITEM:
        cartStore.addItem(action.item);
        break;

      case REMOVE_ITEM:
        cartStore.removeItem(action.item);
        break;
    }
    cartStore.emitChange();
  });

  return {
    addListener: (l) => cartStore.addListener(l),
    cartItems: () => cartStore.cartItems
  };
});

m.value("catalogItems", [
  {id: 1, title: 'Widget #1', cost: 1},
  {id: 2, title: 'Widget #2', cost: 2},
  {id: 3, title: 'Widget #3', cost: 3}
]);



//-------------VIEW-------------

class CatalogCtrl {
  constructor(catalogItems, cartActions) {
    this.cartActions = cartActions;
    this.catalogItems = catalogItems;
  }

  addToCart(catalogItem) {
    this.cartActions.addItem(catalogItem);
  }
}
m.controller("CatalogCtrl", CatalogCtrl);


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
    this.cartActions.removeItem(item);
  }
}
m.controller("CartCtrl", CartCtrl);