var Liquid = React.createClass({
	getInitialState: function() {
		return {
			currentTemp: 10
		};
	},
	setTemperature: function(e) {
		// e.target.value is the text from our input
		this.setState({currentTemp: e.target.value});
		console.log(this)
		console.log(this.state.currentTemp)
	},
	render: function() {
		// empty variable that will hold either "Liquid", "Solid", or "Gas"
		var stateOfMatter;

		// If temp is on/below freezing, it's a solid
		if (this.state.currentTemp <= this.props.config.freezing) {
			stateOfMatter = 'Solid';

		// if temp is on/above boiling, it's a gas
		} else if (this.state.currentTemp >= this.props.config.boiling) {
			stateOfMatter = 'Gas';

		// otherwise it's just a liquid
		} else {
			stateOfMatter = 'Liquid';
		}

		return (
			<div>
				<input type="text" onChange={ this.setTemperature } defaultValue={ this.state.currentTemp } />
				<p>At { this.state.currentTemp }°F, { this.props.config.name } is considered to be a "{ stateOfMatter }" state of matter.</p>
			</div>
		);

	}
});

var LiquidsList = React.createClass({
	render: function() {
		var liquids = this.props.liquids.map(function(liquidObject, index){
						return <Liquid config={ liquidObject } key={ index } />;
					  })
		return (
			<div>
				{ liquids }
			</div>
		);

	}
});

var ethanol = {
	name: "Ethanol",
	freezing: -173.2,
	boiling: 173.1
};
var water = {
	name: "Water",
	freezing: 32,
	boiling: 212
};

ReactDOM.render(<LiquidsList liquids={ [ethanol, water] } />, document.getElementById('form'));