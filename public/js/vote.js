var frankAppVoter = angular.module('frankAppVoter', ['ngFitText', 'frank2015', 'ngAnimate', 'ui.bootstrap']);


frankAppVoter.controller('voteCtrl', ['$scope', '$http', 'localStorageService', '$timeout', '$window', '$interval',
	function($scope, $http, localStorageService, $timeout, $window, $interval) {
		$scope.storage = localStorageService;
		$scope.userVote = [];

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

		var watchVote = function(index) {
			var start_time = parseInt($scope.votes[index].start_time, 10);

			if(start_time <= Date.now()) {
				$scope.voteOpen[index] = true;
			} else if((start_time - Date.now()) > 3601000) {
				$timeout(function() {watchVote(index);}, 3600000);
			} else if((start_time - Date.now()) > 1801000) {
				$timeout(function() {watchVote(index);}, 1800000);
			} else if((start_time - Date.now()) > 601000) {
				$timeout(function() {watchVote(index);}, 600000);
			} else if((start_time - Date.now()) > 301000) {
				$timeout(function() {watchVote(index);}, 300000);
			} else if((start_time - Date.now()) > 61000) {
				$timeout(function() {watchVote(index);}, 60000);
			} else if((start_time - Date.now()) > 100) {
				$timeout(function() {watchVote(index);}, 100);
			} else {
				$scope.voteOpen[index] = true;
			}
		};

		var watchBallot = function(index) {
			if(!$scope.voteOpen[index]) {
				var deregisterWatch = $scope.$watch(function() {return $scope.voteOpen[index];},
					function(newValue) {
						if(newValue) {
							deregisterWatch();
							$scope.ballotOpen[index] = true;
							$timeout(function() {watchBallot(index);}, 1000);	//We can assume a vote will be open for at least 1 second.
						}
					}
				);
			} else {
				if((parseInt($scope.votes[index].start_time, 10) + parseInt($scope.votes[index].duration, 10)) < Date.now()) {
					$scope.ballotOpen[index] = false;
				} else {
					$timeout(function() {watchBallot(index);}, 100);
				}
			}
		};

		var setupOpenStatuses = function() {
			for(var i=0; i<$scope.votes.length; i++) {
				if(parseInt($scope.votes[i].start_time, 10) <= Date.now()) {
					$scope.voteOpen[i] = true;
				} else {
					$scope.voteOpen[i] = false;
					watchVote(i);
				}

				if(((parseInt($scope.votes[i].start_time, 10) + parseInt($scope.votes[i].duration, 10)) >= Date.now()) && $scope.voteOpen[i]) {
					$scope.ballotOpen[i] = true;
					watchBallot(i);
				} else if((parseInt($scope.votes[i].start_time, 10) + parseInt($scope.votes[i].duration, 10)) < Date.now()) {
					$scope.ballotOpen[i] = false;
				} else {
					$scope.ballotOpen[i] = false;
					watchBallot(i);
				}
			}
		};
		
		$scope.votes = [];
		$scope.voteOpen = [];
		$scope.ballotOpen = [];
		var getVotes = function() {
			$http.post('../../app/controllers/get_votes.php', {'user_id' : user_id, 'email' : email, 'username' : username}).success(function(response) {
				$scope.votes = response;
				setupOpenStatuses();
			}).error(function(response, status) {
				if(status === 500) {
					$window.alert("There was an error connecting to the servers.  Please try again later.");
				} else if(status === 400 || status === 401) {
					$scope.storage.remove('user_id');
					$scope.storage.remove('email');
					$scope.storage.remove('username');

					$window.location.href = 'login.html';
				}
			});
		};

		getVotes();
		$interval(getVotes, 30000);	//Refresh data every 30 seconds.

		$scope.submitVote = function(index) {
			var submission_time = Date.now();
			if(submission_time <= ($scope.votes[index].start_time + $scope.votes[index].duration)) {
				$http.post('../../app/controllers/submit_vote.php', {'vote_id' : $scope.votes[index].id, 'user_id' : user_id, 'email' : email, 'username' : username, 'choice' : $scope.userVote[index], 'submission_time' : submission_time}).success(function(response) {
					$window.alert("Your ballot has been submitted.");
				}).error(function(response, status) {
					if(status === 500) {
						$window.alert("There was an error contacting our servers.  Please try again, quickly.");
					} else if((status === 400 && response.message === 'Credentials not set.') || status === 401) {
						$scope.storage.remove('user_id');
						$scope.storage.remove('email');
						$scope.storage.remove('username');

						$scope.votes[index].user_choice = $scope.userVote[index];

						$window.location.href = 'login.html';
					} else {
						$window.alert(response.message);
					}
				});
			} else {
				$window.alert("Sorry, the polls already closed for this vote.");
			}
		};
	}
]);