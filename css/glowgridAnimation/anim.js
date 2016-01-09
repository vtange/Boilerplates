(function() {
    //start of function
	var numCols;
	var numRows;
	function generateGrid(){
		$('#grid').html("");
		var whole = $('<div id="whole"></div>')
		var row = $('<div class="cell-row"></div>')
		var cellSize = 50;
		numCols = window.innerWidth % cellSize === 0? window.innerWidth / cellSize : Math.ceil(window.innerWidth / cellSize) ;
		numRows = window.innerHeight % cellSize === 0? window.innerHeight / cellSize : Math.ceil(window.innerHeight / cellSize) ;
		for (var i = 0; i < numRows; i++){
			row = $('<div class="cell-row"></div>')
			for (var j = 0; j < numCols; j++){
				var cell = $('<div id="row'+i+'num'+j+'" class="grid-element" style="height:'+cellSize+'px;width:'+cellSize+'px;"></div>');
				row.append(cell);
			}
			whole.append(row);
		}
		$('#grid').append(whole);
	};
	generateGrid();
	$(window).resize(generateGrid);
	function glow(){
		var x = Math.floor(Math.random()*numCols);
		var y = Math.floor(Math.random()*numRows);
		console.log(x+","+y)
		var r = Math.floor(Math.random()*(255-150)+150);
		var g = Math.floor(Math.random()*(255-150)+150);
		var b = Math.floor(Math.random()*(255-150)+150);
		document.getElementById('row'+y+'num'+x).style.backgroundColor='rgb('+r+','+g+','+b+')';
		function unglow(){
			document.getElementById('row'+y+'num'+x).style.backgroundColor='';
		}
		//remove class after set amt of time
		setTimeout(unglow,1000);
	}
	setInterval(glow,750);
	
	
  //end of function
})();
