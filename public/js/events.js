var frankAppEventDirectory = angular.module("frankAppEventDirectory", ['LocalStorageModule', 'frank2015']);
/**
* This controller is very simple.  All it has to do is determine if the user
* can view this page, redirecting them to the login page if not, and determine
* if the survey button should be clickable yet (this will only happen on the
* last day of the event).
*/
frankAppEventDirectory.controller('eventsDirectoryCtrl', ['$scope', 'localStorageService', '$window', '$http',
	function($scope, localStorageService, $window, $http) {
		$scope.storage = localStorageService;

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
	}
]);