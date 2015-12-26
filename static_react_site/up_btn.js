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
