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
