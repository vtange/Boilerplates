var alt = require('../alt');

class LocationStore {
  constructor() {
	  this.locations = [];
  }
}

module.exports = alt.createActions(LocationActions);