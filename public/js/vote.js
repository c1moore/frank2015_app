var frankAppVoter = angular.module('frankAppVoter', ['ngFitText', 'frank2015', 'ngAnimate']);


frankAppFBook.controller('ParticipantController', ['$scope', '$http', 'localStorageService', '$timeout', '$window'
	function($scope, $http, localStorageService, $window, interestsService, $timeout, $window) {
		$scope.storage = localStorageService;
		$scope.intServArr = interestsService.interests;
		$scope.userVote = [];

		//Check if the user is logged in.  If not, they should be redirected to the login page.
		var user_id = $scope.storage.get('user_id'),
			email = $scope.storage.get('email'),
			username = $scope.storage.get('username');
		/*if(user_id && email) {
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

		$scope.getTopMargin = function(height) {
			var margin = parseInt(angular.element("#header").css('height'), 10) + height;
			return margin + "px";
		};

		var watchVote = function(index) {
			if($scope.votes[i].start_time >= Date.now()) {
				$scope.voteOpen[index] = true;
			} else {
				$timeout(watchVote(index), 100);
			}
		};

		var watchBallot = function(index) {
			if(!$scope.voteOpen[index]) {
				var deregisterWatch = $scope.$watch(function() {return $scope.voteOpen[index];},
					function(newValue) {
						if(newValue) {
							deregisterWatch();
							$scope.ballotOpen[index] = true;
							$timeout(watchBallot(index), 1000);	//We can assume a vote will be open for at least 1 second.
						}
					}
				);
			} else {
				if(($scope.votes[index].start_time + $scope.votes[i].duration) > Date.now()) {
					$scope.ballotOpen[index] = false;
				} else {
					$timeout(watchBallot(index), 100);
				}
			}
		};

		var setupOpenStatuses = function() {
			for(var i=0; i<$scope.votes.length; i++) {
				if($scope.votes[i].start_time >= Date.now()) {
					$scope.voteOpen[i] = true;
				} else {
					$scope.voteOpen[i] = false;
					watchVote(i);
				}

				if(($scope.votes[i].start_time + $scope.votes[i].duration) <= Date.now() && $scope.voteOpen[i]) {
					$scope.ballotOpen[i] = true;
					watchBallot(i);
				} else if(($scope.votes[i].start_time + $scope.votes[i].duration) > Date.now) {
					$scope.ballotOpen = false;
				} else {
					$scope.ballotOpen[i] = false;
					watchBallot(i);
				}
			}
		};
		
		$scope.votes = [];
		$scope.voteOpen = [];
		$scope.ballotOpen = [];
		$http.post('../../app/controllers/get_votes.php', {'user_id' : user_id, 'email' : email, 'username' : username}).success(function(response) {
			$scope.votes = response;
			setupOpenStatuses();
		}).error(function(response, status) {
			$window.alert("There was an error connecting to the servers.  Please try again later.");
		});

		$scope.submitVote = function(index) {
			var submission_time = Date.now();
			if(submission_time <= ($scope.votes[i].start_time + $scope.votes[i].duration)) {
				$http.post('../../app/controllers/submit_vote.php', {'vote_id' : votes[index].id, 'user_id' : user_id, 'email' : email, 'username' : username, 'choice' : userVote[index], 'submission_time' : submission_time}).success(function(response) {
					$window.alert("Your ballot has been submitted.");
				}).error(function(response, status) {
					if(status === 500) {
						$window.alert("There was an error contacting our servers.  Please try again, quickly.");
					} else {
						$window.alert(response);
					}
				});
			} else {
				$window.alert("Sorry, the polls already closed for this vote.");
			}
		};
	}
]);