var frankAppLogin = angular.module('frankAppLogin', ['LocalStorageModule', 'frank2015']);

/**
* This controller will handle user login attempts.  If a login attempt is successful, the user's
* information will be saved to localstorage so they do not have to login again on this device and
* they will be redirected to the main page.
*
* TODO Have a set amount of login attempts.
*/
frankAppLogin.controller('signinCtrl', ['$scope', 'localStorageService', '$http', '$location',
	function($scope, localStorageService, $http, $location) {
		$scope.credentials = {};
		$scope.storage = localStorageService;
		
		$scope.signin = function() {
			$scope.error = "";
			$http.post('../../app/controllers/validate_login.php', $scope.credentials).success(function(response) {
				$scope.storage.set(user_id, response.user_id);
				$scope.storage.set(username, response.username);
				$scope.storage.set(email, response.email);

				$location('directory.html');
			}).error(function(response, status) {
				$scope.storage.remove('user_id');
				$scope.storage.remove('email');
				$scope.storage.remove('username');

				$scope.credentials.password = "";

				if(status === 500) {
					$scope.error = "Error connecting to servers.  Please try again later.";
				} else {
					$scope.error = "Username/email unknown or password does not match.";
				}
			});
		};
	}
]);