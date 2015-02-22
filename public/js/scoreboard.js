var frankScoreboardAdmin = angular.module('frankScoreboardAdmin', ['mgcrea.ngStrap', 'frank2015', 'ngTable']);

frankScoreboardAdmin.controller('scoreboardCtrl', ['$scope', '$timeout', 'localStorageService', '$window', '$interval', '$http', 'ngTableParams', '$filter',
	function($scope, $timeout, localStorageService, $window, $interval, $http, ngTableParams, $filter) {
		$scope.storage = localStorageService;
		
		//Check if the user is logged in.  If not, they should be redirected to the login page.
		var user_id = $scope.storage.get('user_id'),
			email = $scope.storage.get('email'),
			username = $scope.storage.get('username');
		if(user_id && email) {
			$http.post('../../app/controllers/check_credentials.php', {user_id : user_id, email : email, username : username, 'check_admin' : true}).error(function() {
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

		$scope.krewes = [];
		$scope.filters = {
			myfilter : ''
		};

		$scope.retreiveData = true;

		$scope.scoreboard = new ngTableParams({
			page : 1,
			count : 10,
			sorting : {
				score : 'desc'
			},
			filter : $scope.filters
		}, {
			counts : [5, 10, 15, 20],
			getData : function($defer, params) {
				if($scope.retreiveData) {
					$http.post('../../app/controllers/get_admin_krewes.php', {'user_id' : user_id, 'email' : email, 'username' : username}).success(function(response) {
						$scope.retreiveData = false;
						$scope.krewes = response;

						params.total($scope.krewes.length);

						var filteredData = params.filter() ? $filter('filter')($scope.krewes, params.filter().myfilter) : $scope.krewes;
						var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
						$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

					}).error(function(response, status) {
						if((status === 400 && response.message === "Credentials not set.") || status === 401) {
							$scope.storage.remove('user_id');
							$scope.storage.remove('email');
							$scope.storage.remove('username');

							$window.location.href = "login.html";
						} else if(response.message === "Not an admin.") {
							$window.location.href = "directory.html";
						} else if(status === 500) {
							$window.alert("There was an error connecting with the servers.  Please refresh the page.");
						} else {
							$window.alert(response.message);
						}
					});
				} else {
					var filteredData = params.filter() ? $filter('filter')($scope.krewes, params.filter().myfilter) : $scope.krewes;
					var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));					
				}
			}
		});

		/**
		* Reloading the table seems to be precarious.  Just in case it needs
		* to be modified, keep it in a separate function.
		*/
		var reloadData = function() {
			$scope.retreiveData = true;

			$timeout(
				function() {
					$scope.scoreboard.reload();
				}
			);
		};

		$interval(reloadData, 10000);	//Refresh data every 10 seconds.
		
		$scope.team = {};	//Data to add another krewe team.
		$scope.team.members = [];
		$scope.team.members[0] = {};

		$scope.resetForm = function() {
			$scope.team = {};
			$scope.team.members = [];
			$scope.team.members[0] = {};
		};
				
		/**
		* Called when the admin submits the form to create a new team.
		*/
		$scope.createKrewe = function() {
			$scope.team.username = username;
			$scope.team.email = email;
			$scope.team.user_id = user_id;
			
			$http.post('../../app/controllers/create_krewe.php', $scope.team).success(function(response) {
				reloadData();
				$scope.resetForm();
			}).error(function(response, status) {
				if((status === 400 && response.message === "Credentials not set.") || (status === 401 && response.message !== "Not an admin.")) {
					$scope.storage.remove('user_id');
					$scope.storage.remove('email');
					$scope.storage.remove('username');

					$window.location.href = "login.html";
				} else if(response.message === "Not an admin.") {
					$window.location.href = "directory.html";
				} else if(status === 500) {
					$window.alert("Error connecting to server.  Please try again.");
				} else {
					$window.alert(response.message);
				}
			});
		};

		/**
		* When a team earns an addition point, increment the team's score in
		* the database.
		*/
		$scope.addPoint = function(id) {
			$http.post('../../app/controllers/increment_krewe_score.php', {username : username, user_id : user_id, email : email, krewe_id : id}).success(function(response) {
				reloadData();
			}).error(function(response, status) {
				if((status === 400 && response.message === "Credentials not set.") || (status === 401 && response.message !== "Not an admin.")) {
					$scope.storage.remove('user_id');
					$scope.storage.remove('email');
					$scope.storage.remove('username');

					$window.location.href = "login.html";
				} else if(response.message === "Not an admin.") {
					$window.location.href = "directory.html";
				} else if(status === 500) {
					$window.alert("Error connecting to server.  Please try again.");
				} else {
					$window.alert(response.message);
				}
			});
		};
	}
]);