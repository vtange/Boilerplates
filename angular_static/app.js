(function() {
    //start of function
  var app = angular.module('ThisApp', ['filters']);

app.factory('memory', function($http){
/*
  var baseUrl = "http://www.freecodecamp.com/news/hot/";
*/
  var storage = {};
 storage.datadata = [];
/*
    $http.defaults.headers.common["X-Custom-Header"] = "Angular.js";
    $http.jsonp(baseUrl + "?callback=JSON_CALLBACK")
    .success(function(data1) {
        storage.datadata = data1;
     })
    .error(function(data1) {
        storage.datadata = [];
        console.log("error0");
     });
    //end info pulling
*/
  return storage;
});//end of service

app.controller('MainCtrl', ['$scope', '$timeout', '$interval', 'memory', function($scope, $timeout, $interval, memory){
    $scope.storage = memory; // load service
	//Variables
	$scope.variable1 = "This is Variable1"
	//Listing
	$scope.list = [{num:1},{num:2},{num:3},{num:4},{num:5}];
	//Forms
	$scope.searchtxt = "enter text here";
	//Tabs
	$scope.availTabs = [1,2,3];
	$scope.tab = 1;
	$scope.selectTab = function(num){
		if($scope.tab!=num){
			$scope.tab = num;
		}
	}
	$scope.active = function(num){
		if ($scope.tab == num){
			return {    "background": "#ccc"   }
		};
	}
	//Timeout and Intervals
	$scope.variable2 = 100;
	$timeout(function(){
		$interval(function(){$scope.variable2 += 10;},1000)
	},1000)
	
	//Interact with other Libraries $sce, $digest, apply  -> check formatter app
	$scope.longerList = function(){
		//list auto updates due to Angular making the changes
		//$scope.list = [{num:5},{num:5},{num:5},{num:5},{num:5}];
		$scope.list.push({num:($scope.list.length+1)})
	}
}]);//end of controller
  //end of function
})();
