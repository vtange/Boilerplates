var alt = require('../alt');
var LocationActions = require('../actions/LocationActions');

class FavoritesStore {
  constructor() {
	  //this is list of data (cities in this case)
    this.locations = [];
	  //bindListeners <---> dispatch in LocationActions
    this.bindListeners({
      addFavoriteLocation: LocationActions.FAVORITE_LOCATION
    });
  }
	
  addFavoriteLocation(location) {
    this.locations.push(location);
  }
}

module.exports = alt.createStore(FavoritesStore, 'FavoritesStore');	//createStore takes in an Object, creates a 'singleton store'
