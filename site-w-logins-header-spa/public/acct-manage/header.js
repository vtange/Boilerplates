(function() {
    //start of function
  var app = angular.module('header', ['userService']);

app.controller('LoginCtrl', ['$scope', '$http', '$window', 'memory', function($scope, $http, $window, memory){
	function getRootUrl() {
		return $window.location.origin?$window.location.origin+'/':$window.location.protocol+'/'+$window.location.host+'/';
	}
	$scope.service1 = memory;
	$scope.info = {};
	$scope.showLogin = false;
	$scope.toggleLogin = function(){
		$scope.showLogin = !!($scope.showLogin)?false:true;
	}
    $scope.login = function(){
		$http.post(getRootUrl()+"login",$scope.info).success(function(data){
			//check if data has a user or not
			if(data.id){
				$scope.service1.user = data;
				$scope.user = data;
			}
			else{
				$scope.message = data.message[0];
			}
			
		}).error(function(err){
			throw err;
		})
		
		
	}
	$scope.autologUser = function(user){
		var info = {id:user._id, username: user.local.username, email: user.local.email,avatar:user.local.avatarURL};
		$scope.service1.user = info;
		$scope.user = info;
	}
}]);//end of controller
  //end of function
})();
