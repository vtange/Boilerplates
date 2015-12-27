var Liquid = React.createClass({
	getInitialState: function() {
		return {
			currentTemp: 10
		};
	},
	setTemperature: function(e) {
		this.setState({currentTemp: e.target.value});
	},
	render: function() {

		var stateOfMatter;		// empty variable that will hold either "Liquid", "Solid", or "Gas"

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
var list = [{num:1},{num:2},{num:3},{num:4},{num:5}];

var List = React.createClass({
	render: function() {
		var renderedList = list.map(function(item, i){
			return <li key={i}>{JSON.stringify(item)}</li>
		})
		return (
			<ul>{renderedList}</ul>
	)}/* div required: can only render 1 set of elements *//* Cannot render JSON raw */
});
var List2 = React.createClass({
	render: function() {
		var isTwo = function(input){
			return input.num == 2;
		}
		var renderedList = list.map(function(item, i){
			return <li key={i}>{isTwo(item).toString()}</li>
		})
		return (
			<ul>{renderedList}</ul>
	)}/* Cannot render booleans raw */
});
var List3 = React.createClass({
	render: function() {
		var threeplus = function(input){
			return input.num > 3;
		}
		var renderedList = list.filter(threeplus).map(function(item, i){
			return <li key={i}>{JSON.stringify(item)}</li>
		})
		return (
			<ul>{renderedList}</ul>
	)}
});



ReactDOM.render(<List />, document.getElementById('list1'));
ReactDOM.render(<List2 />, document.getElementById('item_filt'));
ReactDOM.render(<List3 />, document.getElementById('list_filt'));

var ListAdd = React.createClass({
	onClick: function(){
		list.push({num:(list.length+1)});
		console.log(list);
	},
	render: function() {
		return (
		<button onClick={this.onClick}>
			<span>{this.props.text}</span>
		</button>
	)}
});

ReactDOM.render(<ListAdd text="add something to list" />, document.getElementById('list_add'));

var availTabs = [1,2,3];

var Tab = React.createClass({
	render: function(){
		if(this.props.active){
			return <li onClick={this.props.onClick} className="tab + active">{this.props.tabText}</li>;
		}
		return <li onClick={this.props.onClick} className="tab">{this.props.tabText}</li>;
	}
});

var TabsList = React.createClass({
	getInitialState: function() {
		return {
			onTab: 1
		};
	},
	handleClick: function(e) {
		this.setState({ onTab: parseInt(e.target.innerHTML,10) },function () {/*setState is not instant, do something here like you would an async function*/});
	},
	render: function(){
		var tabs = availTabs.map((item,i) => {
			var isItActive = this.state.onTab === item;
			 return <Tab active={isItActive} key={i} tabText={item} onClick={this.handleClick}/>
			 });
		return <ul className="horiz-list" >{	tabs	}</ul>;
	}
});

ReactDOM.render(<TabsList />, document.getElementById('tabs'));

var Timer = React.createClass({

    getInitialState: function(){

        // This is called before our render function. The object that is 
        // returned is assigned to this.state, so we can use it later.

        return { elapsed: 0 };
    },

    componentDidMount: function(){

        // componentDidMount is called by react when the component 
        // has been rendered on the page. We can set the interval here:
		
        this.timer = setTimeout(()=>{setInterval(this.tick, 50)},700);
    },

    componentWillUnmount: function(){

        // This method is called immediately before the component is removed
        // from the page and destroyed. We can clear the interval here:

        clearInterval(this.timer);
    },

    tick: function(){

        // This function is called every 50 ms. It updates the 
        // elapsed counter. Calling setState causes the component to be re-rendered

        this.setState({elapsed: new Date() - this.props.start});
    },

    render: function() {
        
        var elapsed = Math.round(this.state.elapsed / 100);

        // This will give a number with one digit after the decimal dot (xx.x):
        var seconds = (elapsed / 10).toFixed(1);    

        // Although we return an entire <p> element, react will smartly update
        // only the changed parts, which contain the seconds variable.

        return <p>This example was started <b>{seconds} seconds</b> ago.</p>;
    }
});


ReactDOM.render(<Timer start={Date.now()} />,document.getElementById('timed_var'));
var FancyButton = React.createClass({
	render: function() {
		return (
		<button onClick={this.props.onClick}>
			<i className={"fa " + this.props.icon}></i>
			<span>{this.props.text}</span>
		</button>
	)}
});

var HelloWorld = React.createClass({
	getInitialState: function() {
		return {
			counter: 0
		};
	},

	increment: function() {
		this.setState({ counter: this.state.counter+1 });
	},

	render: function() {
		return <div>
			<div>{this.state.counter}</div>
			<FancyButton text="Increment!" icon="fa-arrow-circle-o-up" onClick={this.increment} />
		</div>;
	}
});

ReactDOM.render(<HelloWorld />, document.getElementById('btn'));

var Var1 = React.createClass({
	render: function() {
		var variable1 = "This is Variable1";
		return (
			<div>
			<span>{variable1}</span>
			<span>{this.props.text}</span>
			</div>
	)}/* div required: can only render 1 set of elements */
});

ReactDOM.render(<Var1 text="This is Prop1" />, document.getElementById('var1'));
