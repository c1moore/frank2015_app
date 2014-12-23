var frankAppFBook = angular.module('frankAppFBook', ['angular-carousel', 'ngFitText', 'frank2015', 'ngAnimate', 'pasvaz.bindonce']);

frankAppFBook.controller('ParticipantController', ['$scope', '$http', 'localStorageService', '$window', 'interestsService',
	function($scope, $http, localStorageService, $window, interestsService) {
		$scope.storage = localStorageService;
		$scope.intServArr = interestsService.interests;

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
		$scope.query = {};
		$scope.queryBy = '$';
		$scope.search = false;
		$scope.carouselIndex = 0;
		
		$scope.showing = {name : true, email : false, twitter : true, interests : false};
		
		$scope.showColumn = function(column) {
			$scope.showing[column] = true;
		};

		$scope.getTopMargin = function(height) {
			var margin = parseInt(angular.element("#header").css('height'), 10) + height;
			return margin + "px";
		}
		
		$scope.participants = [];
		$http.post('../../app/controllers/get_participants.php', {'default_path' : '../img/profile_pics/default.jpg', 'default_interests' : ['frank']}).success(function(response) {
			$scope.participants = response;
		}).error(function(response, status) {
			$window.alert("There was an error connecting to the servers (possibly due to all the cool people here).  Please try again later.");
		});
	}
]);
	
	
/*var participantTable = angular.module('participantTable', []);
	
	participantTable.controller('PTableController', ['$scope', function($scope) {
		$scope.showing = {name : true, email : true, twitter : false, interests : false};
		
		$scope.showColumn = function(searchby) {
			angular.forEach($scope.showing, function(key, value) {
				if(key === 'name') {
					continue;
				} else {
					$scope.showing[key] = !($scope.showing[key]);
				}
			});
			$scope.showing[searchby] = true;
		};
	}]);*/