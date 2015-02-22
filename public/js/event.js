var frankAppEvent = angular.module('frankAppEvent', ['frank2015', 'ui.bootstrap']);

/**
* When redirected to this page, the URL should include an anchor tag (i.e.: events/event.html#anchortag).
* This value will be the number id of the event as specified in the db.
*/
frankAppEvent.controller('eventCtrl', ['$scope', '$http', 'localStorageService', '$window', 'interestsService', '$timeout', '$location', '$sce',
	function($scope, $http, localStorageService, $window, interestsService, $timeout, $location, $sce) {
		$scope.storage = localStorageService;
		$scope.intServArr = interestsService.interests;
		$scope.status = {};
		$scope.status.open = [];
		$scope.page = parseInt($location.hash(), 10);

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

		/**
		* Return the header for this page based on the value of the 'hash'.
		*/
		$scope.getHeader = function() {
			if($scope.page === 1) {
				return "Huddle 1";
			}
			if($scope.page === 2) {
				return "Huddle 2";
			}
		};

		$scope.eventHeader = $scope.getHeader();
		
		var getEvents = function() {
			$scope.events = [];
			$http.post('../../app/controllers/get_event_details.php', {user_id : user_id, email : email, username : username, 'event_id' : $scope.page}).success(function(response) {
				for(var i = 0; i<response.length; i++) {
					response[i].description = $sce.trustAsHtml(response[i].description);
				}
				$scope.events = response;
			}).error(function(response, status) {
				if(status === 401) {
					$scope.storage.remove('user_id');
					$scope.storage.remove('username');
					$scope.storage.remove('email');

					$window.location.href = "login.html";
				}
				
				$window.alert("There was an error connecting to the servers (possibly because our servers cannot handle all awesome people using our app).  Please try again later.");
			});
		};

		getEvents();

		/**
		* Watch the anchor tag for the page in case the user uses the sidebar to navigate to another
		* event's page.
		*/
		$scope.$watch(
			function() {
				return $location.hash();
			},
			function() {
				$scope.page = parseInt($location.hash(), 10);
				$scope.eventHeader = $scope.getHeader();
				getEvents();
			}
		);
	}
]);

frankAppEvent.directive('twitterFeed', ['$http', '$sce', '$interval',
	function($http, $sce, $interval) {
		var twitterFeedDefinition = {
			restrict: 'E',
			scope: {
				feedId: '='
			},
			templateUrl: 'twitter_feed.html',
			link: function postLink($scope, element, attrs) {
				$scope.tweets = [];

				var retreiveTweets = function() {
					$http.get("http://frank.jou.ufl.edu/", {params : {feed : 'fetchtweets', id : $scope.feedId, output : 'json'}}).success(function(response) {
						$scope.tweet_err = false;
						for(var i = 0; i < response.length; i++) {
							$scope.tweets[i] = {};
							$scope.tweets[i].user = {};

							$scope.tweets[i].id = response[i].id;
							$scope.tweets[i].user.profile_image_url = response[i].user.profile_image_url;
							$scope.tweets[i].user.name = response[i].user.name;
							$scope.tweets[i].user.created_at = (new Date(response[i].user.created_at)).toLocaleString();
							$scope.tweets[i].user.screen_name = response[i].user.screen_name;
							$scope.tweets[i].text = $sce.trustAsHtml(response[i].text);
						}
					}).error(function() {
						$scope.tweet_err = true;
					});
				};

				retreiveTweets();

				$interval(retreiveTweets, 60000);
			}
		};

		return twitterFeedDefinition;
	}
]);