var alt = require('../alt');
var LocationActions = require('../actions/LocationActions');

class LocationStore {
  constructor() {
    this.locations = [];												//all stores have space to store things

    this.bindListeners({												//binding action handlers
      handleUpdateLocations: LocationActions.UPDATE_LOCATIONS
    });
  }

  handleUpdateLocations(locations) {									//each store handles own locations storage upon action
    this.locations = locations;
  }
}

module.exports = alt.createStore(LocationStore, 'LocationStore');