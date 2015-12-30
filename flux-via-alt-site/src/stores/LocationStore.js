var alt = require('../alt');
var LocationActions = require('../actions/LocationActions');
var LocationSource = require('../sources/LocationSource');
var FavoritesStore = require('./FavoritesStore');

class LocationStore {
  constructor() {
	  //this is list of data (cities in this case)
    this.locations = [];
	  //store error message -> show if truthy
    this.errorMessage = null;
	  //bindListeners <---> dispatch in LocationActions
    this.bindListeners({
      handleUpdateLocations: LocationActions.UPDATE_LOCATIONS,		//1
      handleFetchLocations: LocationActions.FETCH_LOCATIONS,		//2
      handleLocationsFailed: LocationActions.LOCATIONS_FAILED,		//3
      setFavorites: LocationActions.FAVORITE_LOCATION				//4
    });

    this.exportPublicMethods({
      getLocation: this.getLocation
    });

    this.exportAsync(LocationSource);
  }
/*---*/
/* 1 */
/*---*/
  handleUpdateLocations(locations) {
    this.locations = locations;
    this.errorMessage = null;
  }
/*---*/
/* 2 */
/*---*/
  handleFetchLocations() {
    this.locations = [];
  }
/*---*/
/* 3 */
/*---*/
  handleLocationsFailed(errorMessage) {
    this.errorMessage = errorMessage;
  }

  resetAllFavorites() {
    this.locations = this.locations.map((location) => {
      return {
        id: location.id,
        name: location.name,
        has_favorite: false
      };
    });
  }
/*---*/
/* 4 */
/*---*/
  setFavorites(location) {
    this.waitFor(FavoritesStore);

    var favoritedLocations = FavoritesStore.getState().locations;

    this.resetAllFavorites();

    favoritedLocations.forEach((location) => {
      // find each location in the array
      for (var i = 0; i < this.locations.length; i += 1) {

        // set has_favorite to true
        if (this.locations[i].id === location.id) {
          this.locations[i].has_favorite = true;
          break;
        }
      }
    });
  }

  getLocation(id) {
    var { locations } = this.getState();
    for (var i = 0; i < locations.length; i += 1) {
      if (locations[i].id === id) {
        return locations[i];
      }
    }

    return null;
  }
}

module.exports = alt.createStore(LocationStore, 'LocationStore');	//createStore takes in an Object, creates a 'singleton store'
