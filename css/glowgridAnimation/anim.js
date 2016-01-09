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
				var cell = $('<div id="cell'+i+'-'+j+'" class="grid-element" style="height:'+cellSize+'px;width:'+cellSize+'px;"></div>');
				row.append(cell);
			}
			whole.append(row);
		}
		$('#grid').append(whole);
	};
	generateGrid();
	$(window).resize(generateGrid);
	//glow phase
	function glow(){
		var x = Math.floor(Math.random()*numCols);
		var y = Math.floor(Math.random()*numRows);
		var r = Math.floor(Math.random()*(255-150)+150);
		var g = Math.floor(Math.random()*(255-150)+150);
		var b = Math.floor(Math.random()*(255-150)+150);
		var size = Math.floor(Math.random()*5)*50+50;
		var brush = $('<div id="glow'+y+'-'+x+'" class="glow-element" style="height:'+size+'px;width:'+size+'px;background-color:rgba('+r+','+g+','+b+',0.6)"></div>');
		$('#cell'+y+'-'+x).append(brush);
		$('#glow'+y+'-'+x).velocity({ opacity: 1.0 }, [ 0.17, 0.67, 0.83, 0.67 ]);
		//remove class after set amt of time
		function unglow(){
			$('#glow'+y+'-'+x).velocity({ opacity: 0 }, [ 0.17, 0.67, 0.83, 0.67 ]);
			setTimeout(function(){$('#glow'+y+'-'+x).remove()},600);
		}
		setTimeout(unglow,3000);
	}
	setInterval(glow,1800);
	setInterval(glow,2400);
  //end of function
})();
