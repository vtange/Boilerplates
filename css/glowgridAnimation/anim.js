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

		var r = Math.floor(Math.random()*(255-150)+150);
		var g = Math.floor(Math.random()*(255-150)+150);
		var b = Math.floor(Math.random()*(255-150)+150);
		var size = Math.floor(Math.random()*(3)+1);
		if(size===1){
			if(document.getElementById('row'+y+'num'+x)!==null){
				document.getElementById('row'+y+'num'+x).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
		}
		else if(size===2){
			if(document.getElementById('row'+y+'num'+x)!==null){
				document.getElementById('row'+y+'num'+x).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+y+'num'+(x+1))!==null){
				document.getElementById('row'+y+'num'+(x+1)).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+(y+1)+'num'+(x+1))!==null){
				document.getElementById('row'+(y+1)+'num'+(x+1)).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+(y+1)+'num'+x)!==null){
				document.getElementById('row'+(y+1)+'num'+x).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
		}
		else{//size===3
			if(document.getElementById('row'+y+'num'+x)!==null){
				document.getElementById('row'+y+'num'+x).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+y+'num'+(x+1))!==null){
				document.getElementById('row'+y+'num'+(x+1)).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+(y+1)+'num'+(x+1))!==null){
				document.getElementById('row'+(y+1)+'num'+(x+1)).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+(y+1)+'num'+x)!==null){
				document.getElementById('row'+(y+1)+'num'+x).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+(y+1)+'num'+(x+2))!==null){
				document.getElementById('row'+(y+1)+'num'+(x+2)).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+y+'num'+(x+2))!==null){
				document.getElementById('row'+y+'num'+(x+2)).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+(y+2)+'num'+(x+2))!==null){
				document.getElementById('row'+(y+2)+'num'+(x+2)).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+(y+2)+'num'+x)!==null){
				document.getElementById('row'+(y+2)+'num'+x).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
			if(document.getElementById('row'+(y+2)+'num'+(x+1))!==null){
				document.getElementById('row'+(y+2)+'num'+(x+1)).style.backgroundColor='rgb('+r+','+g+','+b+')';
			}
		}
		//remove class after set amt of time
		function unglow(){
			if(size===1){
				if(document.getElementById('row'+y+'num'+x)!==null){
					document.getElementById('row'+y+'num'+x).style.backgroundColor='';
				}
			}
			else if(size===2){
				if(document.getElementById('row'+y+'num'+x)!==null){
					document.getElementById('row'+y+'num'+x).style.backgroundColor='';
				}
				if(document.getElementById('row'+y+'num'+(x+1))!==null){
					document.getElementById('row'+y+'num'+(x+1)).style.backgroundColor='';
				}
				if(document.getElementById('row'+(y+1)+'num'+(x+1))!==null){
					document.getElementById('row'+(y+1)+'num'+(x+1)).style.backgroundColor='';
				}
				if(document.getElementById('row'+(y+1)+'num'+x)!==null){
					document.getElementById('row'+(y+1)+'num'+x).style.backgroundColor='';
				}
			}
			else{//size===3
				if(document.getElementById('row'+y+'num'+x)!==null){
					document.getElementById('row'+y+'num'+x).style.backgroundColor='';
				}
				if(document.getElementById('row'+y+'num'+(x+1))!==null){
					document.getElementById('row'+y+'num'+(x+1)).style.backgroundColor='';
				}
				if(document.getElementById('row'+(y+1)+'num'+(x+1))!==null){
					document.getElementById('row'+(y+1)+'num'+(x+1)).style.backgroundColor='';
				}
				if(document.getElementById('row'+(y+1)+'num'+x)!==null){
					document.getElementById('row'+(y+1)+'num'+x).style.backgroundColor='';
				}
				if(document.getElementById('row'+(y+1)+'num'+(x+2))!==null){
					document.getElementById('row'+(y+1)+'num'+(x+2)).style.backgroundColor='';
				}
				if(document.getElementById('row'+y+'num'+(x+2))!==null){
					document.getElementById('row'+y+'num'+(x+2)).style.backgroundColor='';
				}
				if(document.getElementById('row'+(y+2)+'num'+(x+2))!==null){
					document.getElementById('row'+(y+2)+'num'+(x+2)).style.backgroundColor='';
				}
				if(document.getElementById('row'+(y+2)+'num'+x)!==null){
					document.getElementById('row'+(y+2)+'num'+x).style.backgroundColor='';
				}
				if(document.getElementById('row'+(y+2)+'num'+(x+1))!==null){
					document.getElementById('row'+(y+2)+'num'+(x+1)).style.backgroundColor='';
				}
			}
		}
		setTimeout(unglow,1000);
	}
	setInterval(glow,750);
	setInterval(glow,1250);
	
	
  //end of function
})();
