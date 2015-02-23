var frankAppFBook = angular.module('frankAppFBook', ['angular-carousel', 'ngFitText', 'frank2015', 'ngAnimate', 'pasvaz.bindonce', 'infinite-scroll']);


/**
* TODO: Change filter to ng-hide for performance reasons.
*/

frankAppFBook.controller('ParticipantController', ['$scope', '$http', 'localStorageService', '$window', 'interestsService', '$timeout',
	function($scope, $http, localStorageService, $window, interestsService, $timeout) {
		$scope.storage = localStorageService;
		$scope.intServArr = interestsService.interests;

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
		$scope.query = {};
		$scope.queryBy = '$';
		$scope.carouselQuery = '';
		$scope.search = false;
		$scope.carouselIndex = 0;
		$scope.carousel = true;
		$scope.tableLimit = 20;
		
		$scope.showing = {name : true, email : false, twitter : true, interests : false};
		
		$scope.showColumn = function(column) {
			$scope.showing[column] = true;
		};

		$scope.getTopMargin = function(height) {
			var margin = parseInt(angular.element("#header").css('height'), 10) + height;
			return margin + "px";
		};

		$scope.carouselFilter = function(row) {
			var interestMatches = false;
			if(row.interests != undefined) {
				for(var i=0; i<row.interests.length; i++) {
					if(row.interests[i].toLowerCase().indexOf($scope.carouselQuery.toLowerCase() || '') !== -1) {
						interestMatches = true;
						break;
					}
				}
			}

			return (interestMatches || row.name.toLowerCase().indexOf($scope.carouselQuery.toLowerCase() || '') !== -1 || row.email.toLowerCase().indexOf($scope.carouselQuery.toLowerCase() || '') !== -1 || row.twitter.toLowerCase().indexOf($scope.carouselQuery.toLowerCase() || '') !== -1);
		};

		$scope.loadMore = function() {
			$scope.tableLimit += 20;
		};

		var prevTime = Date.now();
		var lastIndexLoaded = 4;		//The carousel loads the first 5 images when buffered.

		/**
		* As the user scrolls, load more images.  The number of images to load will be determined by
		* how fast the user is scrolling.  If the user is scrolling slow (2 slides/5 seconds) only
		* load 4 more images; otherwise, load 9 more images.
		*/
		$scope.$watch('carouselIndex', function() {
			if(!($scope.carouselIndex % 2)) {
				var largeTimePeriod = (Date.now() - prevTime) > 5000;

				//Don't try to load more images if the images have already been loaded.
				if(!(largeTimePeriod && lastIndexLoaded > $scope.carouselIndex + 7)) {
					if(largeTimePeriod) {
						var load = ($scope.participants.length > (lastIndexLoaded + 4)) ? 4 : ($scope.participants.length - (lastIndexLoaded + 1));

						load = ($scope.carouselIndex + 7) - lastIndexLoaded;
					} else {
						var load = ($scope.participants.length > (lastIndexLoaded + 9)) ? 9 : ($scope.participants.length - (lastIndexLoaded + 1));
					}

					for(var i = 0; i < load; i++) {
						var img = new Image();
						img.src = $scope.participants[++lastIndexLoaded].image;
					}
				}

				prevTime = Date.now();
			}
		});

		/**
		* Return the max width for the search bar.  On some screens, the set width is too large and
		* causes it to move to below the link to view the participant table.  To determine the max-width,
		* find the 'View Participant Table' element, determine its width, subtract that from the total
		* width of the screen along with any margins, and return the resulting value.  Unfortunately,
		* this cannot change the problem with the animations.
		*/
		$scope.getSearchMaxWidth = function() {
			var linkelem = angular.element("#carousel-view-switch");
			return $window.innerWidth - linkelem.outerWidth() - 20 - parseInt(angular.element("#carousel-search-box").css('margin-right'), 10);	/*20 is the number of pixels that should remain between the link and the search box.*/
		};
		
		$scope.participants = [];
		$http.post('../../app/controllers/get_participants.php', {user_id : user_id, email : email, username : username, 'default_path' : '../img/profile_pics/default.jpg', 'default_interests' : ['frank']}).success(function(response) {
			$scope.participants = response;
		}).error(function(response, status) {
			if(status === 401) {
				$scope.storage.remove('user_id');
				$scope.storage.remove('username');
				$scope.storage.remove('email');

				$window.location.href = "login.html";
			}
			
			$window.alert("There was an error connecting to the servers (possibly due to all the cool people here).  Please try again later.");
		});
	}
]);