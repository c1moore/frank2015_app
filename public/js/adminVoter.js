var frankAdmin = angular.module('frankAdmin', ['mgcrea.ngStrap']);

/**
* This controller will be used for the admin page to create a new vote.
* At the moment, little security has been planned for this app, but
* these measured will need to be put into place to guarantee only
* admins can create/delete a vote.
*
* TODO SECURITY
* TODO Delete a vote
*/

frankAdmin.controller('votesCtrl', ['$scope', '$timeout', 'localStorageService', '$window', '$interval',
	function($scope, $timeout, localStorageService, $window, $interval) {
		$scope.storage = localStorageService;
		//Check if the user is logged in.  If not, they should be redirected to the login page.
		var user_id = $scope.storage.get('user_id'),
			email = $scope.storage.get('email'),
			username = $scope.storage.get('username');
		/*if(user_id && email) {
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
		}*/

		/**
		* This function is used to make sure everything is filled out
		* properly when the form is submitted to create a vote.
		*/
		var validator = function() {
			$scope.vote.errors = false;
			$scope.vote.errMess = [];
			
			if(!$scope.vote.name.length) {
				$scope.vote.errors = true;
				$scope.vote.errMess.push("Vote name is required.");
			}
			
			if($scope.vote.option == 1) {
				if(!$scope.vote.hours && !$scope.vote.minutes && !$scope.vote.seconds) {
					$scope.vote.errors = true;
					$scope.vote.errMess.push("Enter when the 'polls' should open for this vote.");
				}
			} else {
				if(!$scope.vote.datetime || $scope.vote.datetime == undefined) {
					$scope.vote.errors = true;
					$scope.vote.errMess.push("Enter when the 'polls' should open for this vote.");
				}
			}
			
			if(!$scope.vote.durationhrs && !$scope.vote.durationmns && !$scope.vote.sec) {
				$scope.vote.errors = true;
				$scope.vote.errMess.push("Enter how long this vote should last after opening.");
			}
			
			if(!$scope.vote.question.length) {
				$scope.vote.errors = true;
				$scope.vote.errMess.push("Question is required!");
			}
			
			if($scope.vote.answers.length < 2) {
				$scope.vote.errors = true;
				$scope.vote.errMess.push("At least 2 answers are required.");
			}
			
			for(var i=0; i<$scope.vote.answers.length; i++) {
				if(!$scope.vote.answers[i].text.length) {
					$scope.vote.errors = true;
					$scope.vote.errMess.push("Answers cannot be blank.");
					break;
				}
			}
		};

		//Convert the time entered in the form to create a new vote to milliseconds.
		var intsToMilliseconds = function(hrs, min, sec, ms) {
				hrs = hrs || 0;
				min = min || 0;
				sec = sec || 0;
				ms = ms || 0;

				return (hrs * 3600000) + (min * 60000) + (sec * 1000) + ms;
		};
		
		/*$scope.votes = [
			{name : 'Research Prize', winner : 'Calvin Moore', start : parseInt(Date.now()+30000), duration : 30000, options : [{choice : 'A', percent : 50}, {choice : 'B', percent : 15}, {choice : 'C', percent : 25}, {choice : 'D', percent : 10}]},
			{name : 'Research Prize', winner : 'Calvin Moore', start : parseInt(Date.now()+300000), duration : 120000, options : [{choice : 'A', percent : 10}, {choice : 'B', percent : 10}, {choice : 'C', percent : 10}, {choice : 'D', percent : 10}, {choice : 'E', percent : 10}, {choice : 'F', percent : 10}, {choice : 'G', percent : 10}, {choice : 'D', percent : 10}, {choice : 'D', percent : 10}, {choice : 'D', percent : 10}]},
			{name : 'Research Prize', winner : 'Calvin Moore', start : parseInt(Date.now()-60000), duration : 120000, options : [{choice : 'A', percent : 20}, {choice : 'B', percent : 30}, {choice : 'C', percent : 10}, {choice : 'D', percent : 40}]},
			{name : 'Research Prize', winner : 'Calvin Moore', start : parseInt(Date.now()-600000), duration : 120000, options : [{choice : 'A', percent : 50}, {choice : 'B', percent : 15}, {choice : 'C', percent : 25}, {choice : 'D', percent : 10}]}
		];*/
		var getVoteStats = function() {
			for(var i=0; i<$scope.votes.length; i++) {
				var tempWinner = null,
					tempMax = 0,
					answersLength = $scope.votes[i].answers.length,
					totalVotes = 0;

				for(var j=0; j < answersLength; j++) {
					totalVotes += $scope.votes[i].answers[j].count;
				}

				for(var j=0; j < answersLength; j++) {
					$scope.votes[i].answers[j].percent = $scope.votes[i].answers[j].count / totalVotes;
					
					if(tempMax < $scope.votes[i].answers[j].count) {
						tempMax = $scope.votes[i].answers[j].count;
						tempWinner = $scope.votes[i].answers[j].value;
					} else if(tempMax === $scope.votes[i].answers[j].count && tempMax > 0) {
						tempWinner = tempWinner + ", " + $scope.votes[i].answers[j].value;
					}
				}

				$scope.votes[i].winner = tempWinner;
			}
		};

		$scope.votes = [];
		var getVotes = function() {
			$http.post('../../app/controllers/get_votes_count.php', {'user_id' : user_id, 'email' : email, 'username' : username}).success(function(response) {
				$scope.votes = response;
				getVoteStats();
			}).error(function(response, status) {
				if((status === 400 && response.message === "Credentials not set.") || status === 401) {
					$scope.storage.remove('user_id');
					$scope.storage.remove('email');
					$scope.storage.remove('username');

					$window.location.href = "login.html";
				} else {
					$window.alert("There was an error connecting with the servers.  Please refresh the page.");
				}
			});
		};

		getVotes();
		$interval(getVotes(), 10000);	//Refresh data every 10 seconds.
		
		//Enumerate all the options for the progress bars that can be used to illustrate the current rankings for a given vote.
		$scope.progressClasses = ["progress-bar-success progress-bar-striped active", "progress-bar-info progress-bar-striped active", "progress-bar-warning progress-bar-striped active", "progress-bar-danger  progress-bar-striped active", "progress-bar-striped active", "progress-bar-success progress-bar-striped", "progress-bar-warning progress-bar-striped", "progress-bar-danger progress-bar-striped", "progress-bar-striped", "progress-bar-success", "progress-bar-info", "progress-bar-warning", "progress-bar-danger", ""];
		$scope.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");	//Enumeration of all letter choices available for the answers of a vote.
		
		$scope.vote = {};
		$scope.vote.name = "";
		$scope.vote.option = 1;
		$scope.vote.question = "";
		$scope.vote.answers = [{text : "", id : 'A'}, {text : "", id : 'B'}];
		$scope.vote.placeholders = ["Yes", "Of Course"];
		
		$scope.vote.errors = false;
		$scope.vote.errMess = [];
		
		/**
		* Called when an admin clicks to add an answer option when creating a
		* vote.  Adds the answer and placeholder to the array.
		*/
		$scope.addAnswer = function() {
			$scope.vote.answers.push({text : "", id : $scope.alphabet[$scope.vote.answers.length]});
			$scope.vote.placeholders.push("Answer " + $scope.alphabet[$scope.vote.answers.length-1]);
		}
		
		/**
		* Called when an admin is removing an answer option from the vote.
		* We need to remove this choice from the answers array and the
		* placeholders array, but since the admin can remove an option from
		* the middle of the array we have to iterate through the answers
		* array to correct all the ids so they are ordered properly and there
		* are no duplicates for the id.
		*/
		$scope.removeAnswer = function(index) {
			$scope.vote.answers.splice(index, 1);
			for(var i=0; i<$scope.vote.answers.length; i++) {
				$scope.vote.answers[i].id = $scope.alphabet[i];
			}
			
			$scope.vote.placeholders.splice($scope.vote.placeholders.length-1, 1);
		}
		
		//Reset the create vote form to initial values.
		$scope.resetForm = function() {
			$scope.vote = {};
			$scope.vote.option = 1;
			$scope.vote.question = "";
			$scope.vote.answers = [{text : "", id : 'A'}, {text : "", id : 'B'}];
			$scope.vote.placeholders = ["Yes", "Of Course"];
		}
		
		/**Used to determine if the user can remove an answer.  There has to
		* be at least one answer to remove an answer.
		*/
		$scope.enoughAnswers = function() {
			return $scope.vote.answers.length > 1;
		}
		
		/**
		* Called when the admin submits the form to create a new vote.  This
		* first checks to make sure the form is valid then sends the data to
		* the backend to save the vote.  If there were the issues, the form
		* is reset.
		*/
		$scope.createVote = function() {
			validator();
			if(!$scope.vote.errors) {
				var newVote = {};
				newVote.question = $scope.vote.question;
				newVote.name = $scope.vote.name;
				if($scope.vote.option === 1) {
					newVote.start_time = Date.now() + intsToMilliseconds($scope.vote.hours, $scope.vote.minutes, $scope.vote.seconds);
				} else {
					newVote.start_time = new Date($scope.vote.datetime).getTime();
				}
				newVote.duration = intsToMilliseconds($scope.vote.durationhrs, $scope.vote.durationmns, $scope.vote.durationsec);
				newVote.options = [];
				for(var i=0; i<$scope.vote.answers.length; i++) {
					newVote.options.push({option : $scope.vote.answers[i].id, value : $scope.vote.answers[i].text});
				}

				newVote.username = username;
				newVote.email = email;
				newVote.user_id = user_id;
				
				$http.post('../../app/controllers/create_vote.php', newVote).success(function(response) {
					getVotes();
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
			}
		}
	}
]);

/**
* Filter to convert milliseconds to a human-readable format.  If the
* time remaining is 0, "Closed" is returned instead of 0.  Since hours
* is not expected to be a common unit of measurement for this filter,
* hours will only be displayed if the number of hours remaining is
* greater than 0.
*/
frankAdmin.filter('millisToTime', function() {
	return function(milliseconds) {
		milliseconds = parseInt(milliseconds);
		var hours = Math.floor(milliseconds/3600000);
		milliseconds = (milliseconds%3600000);
		var minutes = Math.floor(milliseconds/60000);
		milliseconds = (milliseconds%60000);
		var seconds = Math.floor(milliseconds/1000);
		milliseconds = (milliseconds%1000);
		
		var time = '';
		if(hours > 0) {
			time = hours + ":";
		}
		
		if(minutes > 9) {
			time += minutes;
		} else {
			time += '0' + minutes;
		}
		
		time += ":";
		
		if(seconds > 9) {
			time += seconds;
		} else {
			time += '0' + seconds;
		}
		
		if(time === "00:00" && milliseconds === 0) {
			time = "Closed";
		}
		
		return time;
	}
});

/**
* Directive for the counters that show the remaining time before a
* vote is closed.  In the last 10 seconds and while it is closed,
* the color of the text is changed to red.  I was able to find some
* directives that already did something similar to this, but nothing
* satisfactory.
*/
frankAdmin.directive('countdown', ['$timeout',
	function($timeout) {
		var countdownDefinition = {
			restrict: 'E',
			scope: {
				start : '@startTime',
				duration : '@'
			},
			template: '<div class="frank-app-countdown">' +
									'{{remaining | millisToTime}}' +
								'</div>',
			link: function postLink(scope, element, attrs) {
				var countdown = function() {
					$timeout(function() {
						scope.remaining = scope.duration-(Date.now()-scope.start);
						if(scope.remaining >= 10)
							countdown();
						else
							scope.remaining = 0;
					}, 10);
					
					//When the timer reaches 10 seconds, make text red.
					if(scope.remaining <= 10999 && scope.remaining >=10899) {
						angular.element(element).addClass("text-error");
					}
				};
				
				$timeout(function() {
					scope.remaining = scope.duration;
					if(scope.start-Date.now() > 0) {
						$timeout(countdown, scope.start-Date.now());
					} else if(-scope.remaining < (scope.start-Date.now())) {
						scope.remaining = -(scope.start-Date.now());
						countdown();
					} else {
						scope.remaining = 0;
						angular.element(element).addClass("text-error");
					}
				}, 0);
			}
		};
		
		return countdownDefinition;
	}
]);