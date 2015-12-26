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
