var availTabs = [1,2,3];

var Tab = React.createClass({
	render: function(){
		if(this.props.active){
			return <li onClick={this.props.onClick} className="tab + active">{this.props.tabText}</li>;
		}
		return <li onClick={this.props.onClick} className="tab">{this.props.tabText}</li>;
	}
});

/*

*/

var TabsList = React.createClass({
	getInitialState: function() {
		return {
			onTab: null
		};
	},
	handleClick: function(e) {
		this.setState({ onTab: parseInt(e.target.innerHTML,10) },function () {
    	console.log(this.state.onTab);
});
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
