var frankAppEvent = angular.module('frankAppEvent', ['frank2015', 'ui.bootstrap']);

/**
* When redirected to this page, the URL should include an anchor tag (i.e.: events/event.html#anchortag).
* This value will be the number id of the event as specified in the db.
*/
frankAppEvent.controller('eventCtrl', ['$scope', '$http', 'localStorageService', '$window', 'interestsService', '$timeout', '$location',
	function($scope, $http, localStorageService, $window, interestsService, $timeout, $location) {
		$scope.storage = localStorageService;
		$scope.intServArr = interestsService.interests;
		$scope.status = {};
		$scope.status.open = [];
		$scope.page = parseInt($location.hash(), 10);

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

		/**
		* Return the header for this page based on the value of the 'hash'.
		*/
		$scope.getHeader = function() {
			if($scope.page === 1) {
				return "Huddle Period 1";
			}
			if($scope.page === 2) {
				return "Huddle Period 2";
			}
		};
		
		$scope.events = [];
		$http.post('../../app/controllers/get_event_details.php', {'event_id' : $scope.page}).success(function(response) {
			$scope.events = response;
		}).error(function(response, status) {
			$window.alert("There was an error connecting to the servers (possibly due to all the cool people here).  Please try again later.");
		});
	}
]);