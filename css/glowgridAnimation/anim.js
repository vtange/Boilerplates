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
	//glow phase
	function glow(){
		var x = Math.floor(Math.random()*numCols);
		var y = Math.floor(Math.random()*numRows);

		var r = Math.floor(Math.random()*(255-150)+150);
		var g = Math.floor(Math.random()*(255-150)+150);
		var b = Math.floor(Math.random()*(255-150)+150);
		var size = Math.floor(Math.random()*(5)+1);
		var brush = [];
		function generateBrush(){
			for(var brushX = 0; brushX < size; brushX++){
				for(var brushY = 0; brushY < size; brushY++){
					brush.push('row'+(y+brushY)+'num'+(x+brushX));
				}
			}
		}
		generateBrush();
		brush.forEach(function(item){
			if(document.getElementById(item)!==null){
				document.getElementById(item).style.backgroundColor='rgba('+r+','+g+','+b+',0.6)';
			}
		})
		//remove class after set amt of time
		function unglow(){
			brush.forEach(function(item){
				if(document.getElementById(item)!==null){
					document.getElementById(item).style.backgroundColor='';
				}
			})
		}
		setTimeout(unglow,1000);
	}
	function glow2(){
		var x = Math.floor(Math.random()*numCols);
		var y = Math.floor(Math.random()*numRows);

		var r = Math.floor(Math.random()*(255-150)+150);
		var g = Math.floor(Math.random()*(255-150)+150);
		var b = Math.floor(Math.random()*(255-150)+150);
		var size = Math.floor(Math.random()*(5)+1);
		var brush = [];
		function generateBrush(){
			for(var brushX = 0; brushX < size; brushX++){
				for(var brushY = 0; brushY < size; brushY++){
					brush.push('row'+(y+brushY)+'num'+(x+brushX));
				}
			}
		}
		generateBrush();
		brush.forEach(function(item){
			if(document.getElementById(item)!==null){
				document.getElementById(item).style.boxShadow='0px 100px rgba('+r+','+g+','+b+',0.6)';
			}
		})
		//remove class after set amt of time
		function unglow(){
			brush.forEach(function(item){
				if(document.getElementById(item)!==null){
					document.getElementById(item).style.boxShadow='';
				}
			})
		}
		setTimeout(unglow,2000);
	}
	setInterval(glow2,4400);
	setInterval(glow,2100);
	
	
  //end of function
})();
