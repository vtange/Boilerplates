var availTabs = [1,2,3];

var Tab = React.createClass({
	render: function(){
		return <li className="tab">{this.props.tabText}</li>;
	}
});

/*
	handleClick: function(tab) {
		console.log("you clicked: " + availTabs[tab])
		this.setState({ onTab: tab });
	},
*/

var TabsList = React.createClass({
	getInitialState: function() {
		return {
			onTab: 1
		};
	},

	render: function() {
		var tabs = availTabs.map(function(item,i){
			 return <Tab key={i} tabText={item}/>
			 });
		return <ul className="horiz-list" >{	tabs	}</ul>;
	}
});

ReactDOM.render(<TabsList />, document.getElementById('tabs'));
