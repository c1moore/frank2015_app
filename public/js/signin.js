var frankAppLogin = angular.module('frankAppLogin', ['LocalStorageModule', 'frank2015']);

/**
* This controller will handle user login attempts.  If a login attempt is successful, the user's
* information will be saved to localstorage so they do not have to login again on this device and
* they will be redirected to the main page.
*
* TODO Have a set amount of login attempts.
*/
frankAppLogin.controller('signinCtrl', ['$scope', 'localStorageService', '$http', '$window',
	function($scope, localStorageService, $http, $window) {
		$scope.credentials = {};
		$scope.storage = localStorageService;

		//Check if the user is already logged in.  If they are, they should be redirected to the directory page.
		var user_id = $scope.storage.get('user_id'),
			email = $scope.storage.get('email'),
			username = $scope.storage.get('username');
		if(user_id && email) {
			$http.post('../../app/controllers/check_credentials.php', {user_id : user_id, email : email, username : username}).success(function() {
				$window.location.href = 'directory.html';
			}).error(function() {
				$scope.storage.remove('user_id');
				$scope.storage.remove('email');
				$scope.storage.remove('username');
			});
		}
		
		$scope.signin = function() {
			$scope.error = "";
			$http.post('../../app/controllers/validate_login.php', $scope.credentials).success(function(response) {
				$scope.storage.set('user_id', response.user_id);
				$scope.storage.set('username', response.username);
				$scope.storage.set('email', response.email);

				$window.location.href = 'directory.html';
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