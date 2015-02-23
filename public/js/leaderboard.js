var frankAppLeaderboard = angular.module('frankAppLeaderboard', ['ngFitText', 'frank2015', 'ngTable']);


/**
* TODO: Change filter to ng-hide for performance reasons.
*/

frankAppLeaderboard.controller('LeaderboardCtrl', ['$scope', '$http', 'localStorageService', '$window', '$timeout', 'ngTableParams', '$filter',
	function($scope, $http, localStorageService, $window, $timeout, ngTableParams, $filter) {
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

		$scope.getTopMargin = function(height) {
			var margin = parseInt(angular.element("#header").css('height'), 10) + height;
			return margin + "px";
		};
		
		$scope.krewes = [];
		$scope.filters = {
			myfilter: ''
		};

		// $scope.getKrewes = function() {
		// };

		$scope.leaderboard = new ngTableParams({
			page : 1,
			count : 10,
			sorting : {
				score : 'desc'
			},
			filter: $scope.filters
		}, {
			groupBy : 'team_name',
			counts : [1, 5, 10, 15, 20],
			getData : function($defer, params) {
				if(!$scope.krewes.length) {
					$http.post('../../app/controllers/get_krewes.php', {user_id : user_id, username : username, email : email}).success(function(response) {
						$scope.krewes = response;

						params.total($scope.krewes.length);

						var filteredData = params.filter() ? $filter('filter')($scope.krewes, params.filter().myfilter) : $scope.krewes;
						var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
						
						//$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
					$defer.resolve(orderedData);
					}).error(function(response, status) {
						if(status === 401) {
							$scope.storage.remove('user_id');
							$scope.storage.remove('username');
							$scope.storage.remove('email');

							$window.location.href = "login.html";
						}
						
						$window.alert("There was an error connecting to the servers (possibly due to all the cool people here).  Please try again later.");
					});
				} else {
					var filteredData = params.filter() ? $filter('filter')($scope.krewes, params.filter().myfilter) : $scope.krewes;
					var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
					
					//$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
					$defer.resolve(orderedData);
				}
			}
		});
	}
]);

frankAppLeaderboard.filter('slice', function() {
	return function(arr, params) {
		return (arr || []).slice((params.page - 1) * params.count, params.page * params.count);
	}
});