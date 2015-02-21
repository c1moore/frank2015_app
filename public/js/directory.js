var frankAppDirectory = angular.module("frankAppDirectory", ['LocalStorageModule', 'frank2015']);
/**
* This controller is very simple.  All it has to do is determine if the user
* can view this page, redirecting them to the login page if not, and determine
* if the survey button should be clickable yet (this will only happen on the
* last day of the event).
*/
frankAppDirectory.controller('directoryCtrl', ['$scope', 'localStorageService', '$window', '$http',
	function($scope, localStorageService, $window, $http) {
		$scope.storage = localStorageService;

		//Check if the user is logged in.  If not, they should be redirected to the login page.
		var user_id = $scope.storage.get('user_id'),
			email = $scope.storage.get('email'),
			username = $scope.storage.get('username');
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
		}

		//Since the survey will only be used once and only at the end of the event, we will only check when the page is refreshed whether the survey is open.
		$scope.isSurveyDisabled = function() {
			return Date.now() < new Date(2015, 1, 27, 11, 30).getTime();
		}

		$scope.getTopMargin = function() {
			var margin = parseInt(angular.element("#header").css('height'), 10) + 25;
			return margin + "px";
		}
	}
]);