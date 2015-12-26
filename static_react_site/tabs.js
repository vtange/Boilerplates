var availTabs = [1,2,3];
var Tabs = React.createClass({
	getInitialState: function() {
		return {
			onTab: 1
		};
	},

	selectTab: function(num) {
		this.setState({ onTab: num });
	},

	render: function() {
		var tabs = availTabs.map(function(item,i){
			 return <li className="tab" key={i}>{item}</li>
			 });
		return <ul className="horiz-list" >{	tabs	}</ul>;
	}
});

ReactDOM.render(<Tabs />, document.getElementById('tabs'));
