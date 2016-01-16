var React = require('react');
var AltContainer = require('alt/AltContainer');
var LocationStore = require('../stores/LocationStore');
var FavoritesStore = require('../stores/FavoritesStore');
var LocationActions = require('../actions/LocationActions');

//return a <li> in <ul> for every elment in this.props.locations
//this.props.locations here === this.locations in FavoritesStore
var Favorites = React.createClass({
  render() {
    return (
      <ul>
        {this.props.locations.map((location, i) => {
          return (
            <li key={i}>{location.name}</li>
          );
        })}
      </ul>
    );
  }
});

//return a <li> in <ul> for every elment in this.props.locations
//this.props.locations here === this.locations in LocationStore
var AllLocations = React.createClass({
  addFave(ev) {
	  //get which element got fav'ed
    var location = LocationStore.getLocation(
      Number(ev.target.getAttribute('data-id'))
    );
	  //use LocationActions' favoriteLocation method
    LocationActions.favoriteLocation(location);
  },

  render() {
    if (this.props.errorMessage) {
      return (
        <div>{this.props.errorMessage}</div>
      );
    }

    if (LocationStore.isLoading()) {
      return (
        <div>
          <img src="ajax-loader.gif" />
        </div>
      )
    }

    return (
      <ul>
        {this.props.locations.map((location, i) => {
		 //faveButton for the unFaved
          var faveButton = (
            <button onClick={this.addFave} data-id={location.id}>
              Favorite
            </button>
          );
	  	  // return <3 or faveButton per location
          return (
            <li key={i}>
              {location.name} {location.has_favorite ? '<3' : faveButton}
            </li>
          );
        })}
      </ul>
    );
  }
});

var Locations = React.createClass({
  componentDidMount() {
    LocationStore.fetchLocations();
  },

  render() {
    return (
      <div>
        <h1>Locations</h1>
        <AltContainer store={LocationStore}>	//connect to full list
          <AllLocations />
        </AltContainer>

        <h1>Favorites</h1>
        <AltContainer store={FavoritesStore}>	//connect to favorite list
          <Favorites />
        </AltContainer>
      </div>
    );
  }
});

module.exports = Locations;
