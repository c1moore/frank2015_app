var frankAppSplash = angular.module('frankAppSplash', ['LocalStorageModule', 'frank2015']);

/**
* The controller for the splash page will display an image (gif) for 5 seconds.  After these 5 seconds
* have passed, we will begin to check the user's authentication.  If the user is logged in, as determined
* by the data stored in localstorage, and this data matches what we have stored in the backend, the user
* can access the app.  If, on the other hand, any of the previous conditions fail, we will reset the
* localstorage and redirect the user to the login/signup page.  It is conceivable that one could
* determine another user's email and user_id; however, this is not a major security concern as it is very
* unlikely
*/
frankAppSplash.controller('splashCtrl', ['$scope', '$timeout', 'localStorageService', '$http', '$location',
	function($scope, $timeout, LocalStorageModule, $http, $location) {
		$scope.storage = localStorageService;
		
		//Let the splash page display for 5 seconds, then check user authentication to redirect them properly.
		$timeout(function() {
			var user_id = $scope.storage.getItem('user_id'),
				email = $scope.storage.getItem('email'),
				username = $scope.storage.getItem('username');

			if(user_id && email && username) {
				$http.post('../../app/controllers/check_credentials.php', {user_id : user_id, email : email, username : username}).success(function() {
					$location('directory.html');
				}).error({
					$scope.storage.remove('user_id');
					$scope.storage.remove('email');
					$scope.storage.remove('username');

					$location('login.html');
				});
			} else {
				$scope.storage.remove('user_id');
				$scope.storage.remove('email');
				$scope.storage.remove('username');
				
				$location('login.html');
			}
		}, 2000);
	}
]);