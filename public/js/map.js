var frankAppMap = angular.module('frankAppMap', ['ngFitText', 'frank2015', 'ngMap']);

frankAppMap.controller('mapCtrl', ['$scope', 'localStorageService', '$window',
	function($scope, localStorageService, $window) {
		$scope.storage = localStorageService;
		$scope.userLoc = false;
		$scope.lat = 0;
		$scope.lng = 0;

		//Check if the user is logged in.  If not, they should be redirected to the login page.
		/*var user_id = $scope.storage.get('user_id'),
			email = $scope.storage.get('email');
		if(user_id && email) {
			$http.post('../../app/controllers/check_credentials.php', {user_id : user_id, email : email, username : username}).error(function() {
				$scope.storage.remove('user_id');
				$scope.storage.remove('email');
				$scope.storage.remove('username');

				$window.location.href = 'login.html';
			});
		} else {
			$scope.storage.remove('user_id');
			$scope.storage.remove('email');
			$scope.storage.remove('username');

			$window.location.href = 'login.html';
		}*/

		$scope.getTopMargin = function(height) {
			var margin = parseInt(angular.element("#header").css('height'), 10) + height;
			return margin + "px";
		};

		$scope.getMapHeight = function() {
			return $window.innerHeight - parseInt(angular.element("#header").css('height'), 10);
		};

		var setLocation = function(position) {
			$scope.userLoc = true;
			//$scope.$apply(function() {
				$scope.lat = position.coords.latitude;
				$scope.lng = position.coords.longitude;
			//});
		};

		$scope.$on('mapInitialized', function(event, map) {
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(setLocation);
				navigator.geolocation.watchPosition(setLocation, null, {enableHighAccuracy : true, timeout : 180000});
			}
		});
	}
]);