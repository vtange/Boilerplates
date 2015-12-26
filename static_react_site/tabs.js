var availTabs = [1,2,3];

var Tab = React.createClass({
	render: function(){
		return <li onClick={this.props.onClick} className="tab">{this.props.tabText}</li>;
	}
});

/*

*/

var TabsList = React.createClass({
	getInitialState: function() {
		return {
			onTab: 1
		};
	},
	handleClick: function(tab) {
		console.log(this.props);
		console.log(this.state);
		this.setState({ onTab: tab });
	},
	render: function(){
		var tabs = availTabs.map((item,i) => {
			 return <Tab key={i} tabText={item} onClick={this.handleClick}/>
			 });
		return <ul className="horiz-list" >{	tabs	}</ul>;
	}
});

ReactDOM.render(<TabsList />, document.getElementById('tabs'));
