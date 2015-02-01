var frankAgenda = angular.module('frankAgenda', ['angular-carousel', 'frank2015']);

/**
* There are 2 alternatives that could be used obtaining events.  The first would be to hardcode the data
* into an array, similar to what I did for the speaker frankbook.  The second method would be to store the
* data in the database.  The second method would be slightly slower, but allow the system to be resued
* again next year; therefore, the events will be stored in the database.
*/

frankAgenda.controller('agendaController', ['$scope', '$http', 'localStorageService', '$window', 'interestsService', '$timeout',
	function($scope, $http, localStorageService, $window, interestsService, $timeout) {
		$scope.storage = localStorageService;
		$scope.intServArr = interestsService.interests;
		$scope.eventColors = ["#73C92D", "#F7B518", "#C54E90", "#F7B518"];	//The order in which to use the frank colors.
		$scope.startDate = new Date(2015, 1, 24);									//Date frank 2015 begins.
		$scope.duration = 4;														//The number of days the event lasts.
		$scope.millisInDay = 1000 * 60 * 60 * 24;

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

		$scope.getEventColor = function(index) {
			return $scope.eventColors[index % $scope.eventColors.length];
		}

		/**
		* Determine the height of the event based on the duration of the event.  starttime and endtime
		* should be in milliseconds.  1 minute = 3 pixels.
		*/
		$scope.getEventHeight = function(starttime, endtime) {
			return (((endtime - starttime) / (60 * 1000)) * 3) + 'px';
		};

		/**
		* Return the time of 12:00am for today in milliseconds.
		*/
		var getMidnightTime = function() {
			var now = new Date();
			var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

			return Date.parse(today);
		};

		/**
		* Return the time for the start of the indexth day in milliseconds.
		*/
		var getStartOfDay = function(index) {
			var now = new Date($scope.startDate + ($scope.millisInDay * index));
			var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

			return Date.parse(today);
		};

		/**
		* Return the time for the end of the indexth day in milliseconds.
		*/
		var getEndOfDay = function(index) {
			var now = new Date($scope.startDate + ($scope.millisInDay * index));
			var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

			return Date.parse(today);
		};

		/**
		* Returns the number of days into the frank 2015.
		*/
		$scope.daysSinceStart = function() {
			var x = (Date.now() - Date.parse($scope.startDate)) / $scope.millisInDay;
			return (x>=0) ? x : 0;
		};

		$scope.day = $scope.daysSinceStart();		//Set the index for the carousel.

		/**
		* Determines if a given event occurs today.  Since events do not go over to the next day, only
		* the start time is needed to determine if the event occurs today.
		*/
		$scope.happensToday = function(index, start_time) {
			return (start_time > getStartOfDay(index)) && (start_time < getEndOfDay(index));
		};

		/**
		* Reorganize returned data to separate events into separate days.
		*/
		$scope.segregateDays = function(diverseArr) {
			$scope.dailyCalendar = [];
			var day = {};
			day.allDayList = [];
			day.hourlyList = [];

			for(var j=0; j<$scope.duration; j++) {
				for(var i=0; i<diverseArr.length; i++) {
					if((diverseArr[i].start_time > getStartOfDay(j)) && (diverseArr[i].start_time < getEndOfDay(j))) {
						if(diverseArr[i].type === "allday") {
							day.allDayList.push(diverseArr[i]);
						} else {
							day.hourlyList.push(diverseArr[i]);
						}
						diverseArr.splice(i, 1);
					}
				}

				$scope.dailyCalendar.push(day);
			}
		};

		/**
		* To speed up retreiving the calendar from the server, first only get events that start today
		* or later.  After this data has been retreived and manipulated, load the data for previous
		* days, manipulate it, and add it to the array.
		*/
		$scope.dailyCalendar = [];
		$http.post('../../app/controllers/get_agenda.php', {'start_date' : 0}).success(function(response) {
			$scope.segregateDays(response);

			/*$http.post('../../app/controllers/get_agenda.php', {'end_date' : getMidnightTime()}).success(function(response) {
				segregateDays(response);
			});*/
		}).error(function(response, status) {
			$window.alert("There was an error connecting to the servers (possibly due to all the cool people here).  Please try again later.");
		});
	}
]);

frankAgenda.filter('millisToTime', function() {
	var getTime = function(time) {
		var date = new Date(time);
		var hour = date.getHours();
		var minutes = date.getMinutes();
		var meridian = null;

		if(hour <= 11) {
			meridian = 'am';
			hour++;
		} else {
			meridian = 'pm';
			hour = (hour % 12) + 1;
		}

		return hour + ':' + minutes + meridian;
	};

	return getTime;
});