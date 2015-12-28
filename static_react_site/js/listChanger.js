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
