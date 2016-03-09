(function() {
    //start of function
  var app = angular.module('userService', []);
	
app.factory('memory', function(){

  var storage = {};

  return storage;
});//end of service
	
  //end of function
})();

