var frankAppSignup = angular.module('frankAppSignup', ['LocalStorageModule', 'frank2015', 'multi-select', 'angularFileUpload']);

/**
* This controller will handle when a user is trying to signup to use this app.  If a user is allowed
* to create an account (as determined by the backend), the user's new user_id, username, and email
* will be stored in local storage and they will be redirected to the directory.
*/
frankAppSignup.controller('signupCtrl', ['$scope', 'localStorageService', '$http', '$location', 'interestsService', '$upload', "$window", '$sce',
	function($scope, localStorageService, $http, $location, interestsService, $upload, $window, $sce) {
		$scope.showEmailHelp = false;
		$scope.showUsernameHelp = false;
		$scope.errors = "";

		$scope.account = {};
		$scope.accountPic = [];
		$scope.storage = localStorageService;
		$scope.selectedInterests = [];

		//Check if the user is already logged in.  If they are, they should be redirected to the directory page.
		var user_id = $scope.storage.get('user_id'),
			email = $scope.storage.get('email');
		if(user_id && email) {
			$http.post('../../app/controllers/check_credentials.php', {user_id : user_id, email : email, username : username}).success(function() {
				$window.location.href = 'directory.html';
			}).error(function() {
				$scope.storage.remove('user_id');
				$scope.storage.remove('email');
				$scope.storage.remove('username');
			});
		}

		/**
		* This code has been adopted from DotDotDot on stackoverflow.com.
		* The link to the original post is here:
		* http://stackoverflow.com/questions/17811305/angular-js-ng-repeat-breaking-apart-a-string
		*/
		var toErrArray = function(dbObject) {
			if(!angular.isArray(dbObject)) {
				return [dbObject];
			} else {
				return dbObject;
			}
		}

		$scope.interestsSelector = [];
		angular.forEach(interestsService.interests, function(value, key) {
			$scope.interestsSelector.push({icon : "<img src='" + value + "' />", name : key, ticked : false});
		});

		$scope.$watch(function() {return $scope.account.retype_password;}, function() {
			$scope.signup.retype_password.$setValidity("passwordsMatch", $scope.account.password === $scope.account.retype_password);
		})
		
		$scope.signUpUser = function() {
			angular.element("button[type='submit']").prop("disabled", true);
			$scope.errors = "";
			$scope.account.interests = [];

			for(var i=0; i<$scope.selectedInterests.length; i++) {
				$scope.account.interests.push($scope.selectedInterests[i].name);
			}

			if($scope.accountPic.length) {
				//If the user is uploading an image of themselves.
				$scope.upload = $upload.upload({
					url: "../../app/controllers/create_account.php",
					method: "POST",
					data: $scope.account,
					file: $scope.accountPic[0]
				}).success(function(response) {
					$scope.storage.set("user_id", response.user_id);
					$scope.storage.set("username", response.username);
					$scope.storage.set("email", response.email);

					$window.location.href = 'directory.html';
				}).error(function(response, status) {
					angular.element("button[type='submit']").prop("disabled", true);
					if(status === 500) {
						$window.alert("Our servers could not handle your awesomeness.  Please try again later (they might be prepared by then).");
					} else {
						$scope.errors = toErrArray(response.message);
						for(var i=0; i<$scope.errors.length; i++) {
							$scope.errors[i] = $sce.trustAsHtml($scope.errors[i]);
						}
					}
				});
			} else {
				//The user had decided not to upload an image.
				$http.post("../../app/controllers/create_account.php", $scope.account).success(function(response) {
					$scope.storage.set("user_id", response.user_id);
					$scope.storage.set("username", response.username);
					$scope.storage.set("email", response.email);

					$window.location.href = 'directory.html';
				}).error(function(response, status, headers) {
					angular.element("button[type='submit']").prop("disabled", true);
					if(status === 500) {
						$window.alert("Our servers could not handle your awesomeness.  Please try again later (they might be prepared by then).");
					} else {
						$scope.errors = toErrArray(response.message);
						for(var i=0; i<$scope.errors.length; i++) {
							$scope.errors[i] = $sce.trustAsHtml($scope.errors[i]);
						}
					}
				});
			}
		};
	}
]);