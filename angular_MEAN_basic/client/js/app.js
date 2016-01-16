(function() {
    //start of function
  var app = angular.module('ListMaker', ['ngResource']);

app.controller('MainCtrl', ['$scope','$resource', function($scope, $resource){

    //Stuff == resource OBJECT, with GET, SAVE, QUERY, REMOVE commands
    var Stuff = $resource('/api/stuff');

    //init list
    $scope.list = [];

    //PRELOAD LIST FROM DATABASE
    Stuff.query(function (results){
        $scope.list = results;
    });

    //add to list fn
    $scope.addObj = function(){
        var newObj = new Stuff;                 //generate resource OBJECT
        newObj.text = $scope.newObj.text;       //insert text into resource OBJECT
        newObj.$save(function (result) {        //cannot do (err, result) -> this will make result return a function, see #1
            $scope.list.push(result);
            console.log($scope.list)
        });
        $scope.newObj = {};
    }
    
    
}]);//end of controller
  //end of function
})();

/*#1 using (err, data) convention:

This convention stipulates that unless there's an error, the  
  first argument passed to the callback will be null, and the second will be  
  your data.
  
  */