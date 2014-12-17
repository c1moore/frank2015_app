var frankAppSignup = angular.module('frankAppSignup', ['LocalStorageModule', 'frank2015', 'multi-select', 'angularFileUpload']);

/**
* This controller will handle when a user is trying to signup to use this app.  If a user is allowed
* to create an account (as determined by the backend), the user's new user_id, username, and email
* will be stored in local storage and they will be redirected to the directory.
*/
frankAppSignup.controller('signupCtrl', ['$scope', 'localStorageService', '$http', '$location', 'interestsService', '$upload',
	function($scope, localStorageService, $http, $location, interestsService, $upload) {
		$scope.showEmailHelp = false;
		$scope.showUsernameHelp = false;

		angular.element("#email").focus(function() {
			$scope.showEmailHelp = true;
		});
		angular.element("#email").blur(function() {
			$scope.showEmailHelp = false;
		});

		angular.element("#username").focus(function() {
			$scope.showUsernameHelp = true;
		});
		angular.element("#username").blur(function() {
			$scope.showUsernameHelp = false;
		});

		$scope.account = {};
		$scope.accountPic = [];
		$scope.storage = localStorageService;

		$scope.interestsSelector = [];
		console.log(interestsService.interests);
		angular.forEach(interestsService.interests, function(value, key) {
			$scope.interestsSelector.push({icon : "<img src='" + value + "' />", name : key, ticked : false});
		});
		
		$scope.signup = function() {
			if($scope.accountPic.length) {
				//If the user is uploading an image of themselves.
				$scope.upload = $upload.upload({
					url: "../../app/controllers/create_account.php",
					method: "POST",
					data: $scope.account,
					file: $scope.accountPic[0]
				}).success(function(response) {

				}).error(function(response, status) {

				});
			} else {
				//The user had decided not to upload an image.
				$http.post("../../app/controllers/create_account.php", $scope.account).success(function(response) {

				}).error(function(response, status) {

				});
			}
		};
	}
]);