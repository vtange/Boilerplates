var List = React.createClass({
	render: function() {
		var list = [{num:1},{num:2},{num:3},{num:4},{num:5}];
		var renderedList = list.map(function(item, i){
			return <li key={i}>{JSON.stringify(item)}</li>
		})
		return (
			<ul>{renderedList}</ul>
	)}/* div required: can only render 1 set of elements */
});



ReactDOM.render(<List />, document.getElementById('list1'));
