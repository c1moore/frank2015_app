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
		$scope.startDate = Date.parse(new Date(2015, 1, 24));									//Date frank 2015 begins.
		$scope.duration = 4;														//The number of days the event lasts.
		$scope.millisInDay = 1000 * 60 * 60 * 24;
		$scope.pixelMinuteRatio = 2;
		$scope.hourlyLeftPos = (25 *2) + (10*2) + 10;	//The size of 2 all-day events (there should be the max # of all day events) plus their left-margin (of 10 pixels) plus the left-margin for the hourly event.
		$scope.hourlyWidth = $window.innerWidth - $scope.hourlyLeftPos - 55;	//The entire width of the screen minus the width of all-day events (times two as there should not be more than 2) minus the left-margin for all-day events (time 2 as there should not be more than 2) minus the margin between all-day and hourly events minus the right-margin of hourly events (including the scrollbar).

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

		$scope.getTopMargin = function(height) {
			var margin = parseInt(angular.element("#header").css('height'), 10) + height;
			return margin + "px";
		};

		/**
		* Height for the ul element.  It should be as large as the visible screen.
		*/
		$scope.slideHeight = function(topMargin) {
			return ($window.innerHeight - parseInt(angular.element("#header").css('height'), 10) - topMargin) + 'px';
		};

		$scope.getEventColor = function(index) {
			return $scope.eventColors[index % $scope.eventColors.length];
		};

		/**
		* Determine whether the time, name, and location should all stay on the same line or if they can fit
		* on separate lines.  To speed up calculations, the start_time and end_time for the previous event that
		* called this function will be stored.  If that same event calls this function again (as determined by
		* the start_time and end_time), the same value can be returned.
		*/
		var prevStartTime = null;
		var prevEndTime = null;
		var prevReturnedDisplay = null;
		$scope.getDisplay = function(starttime, endtime) {
			if(starttime === prevStartTime && endtime === prevEndTime) {
				return prevReturnedDisplay;
			}

			prevStartTime = starttime;
			prevEndTime = endtime;

			if(parseInt($scope.getEventHeight(starttime, endtime), 10) > 85) {
				prevReturnedDisplay = 'block';
			} else {
				prevReturnedDisplay = 'inline-block';
			}

			return prevReturnedDisplay;
		};

		/**
		* Return the distance down the page this event should appear.  To find this, I will use an imaginary
		* grid with the origin in the top left corner of the beginning of the calendar area that corresponds
		* to midnight.  The number of milliseconds from the epoch to the given day will be substracted so
		* only the time that will elapse during the current day remains:
		*
		*		startTime - (startDate + (millisecondsInDay * numberOfDayIntoEvent))
		*
		* This result will then be converted into minutes (by dividing by 60000) and multiplied by the pixels
		* to minute ratio.
		*/
		$scope.getScrollTop = function(starttime, index) {
			return (((parseInt(starttime, 10) - ($scope.startDate + ($scope.millisInDay * parseInt(index, 10)))) / (60 * 1000)) * $scope.pixelMinuteRatio) + 'px';
		};

		/**
		* Determine the height of the event based on the duration of the event.  starttime and endtime
		* should be in milliseconds.  1 minute = 3 pixels.
		*/
		$scope.getEventHeight = function(starttime, endtime) {
			return (((endtime - starttime) / (60 * 1000)) * $scope.pixelMinuteRatio) + 'px';
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
			var x = (Date.now() - $scope.startDate) / $scope.millisInDay;
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
			var day;

			for(var j=0; j<$scope.duration; j++) {
				day = {};
				day.allDayList = [];
				day.hourlyList = [];

				for(var i=0; i<diverseArr.length; i++) {
					if((diverseArr[i].start_time > getStartOfDay(j)) && (diverseArr[i].start_time < getEndOfDay(j))) {
						if(diverseArr[i].type === "allday") {
							day.allDayList.push(diverseArr[i]);
						} else {
							day.hourlyList.push(diverseArr[i]);
						}
						diverseArr.splice(i, 1);
						i--;
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
	return function(time) {
		var date = new Date(time);
		var hour = date.getHours();
		var minutes = date.getMinutes();
		var meridian = null;

		if(hour <= 11) {
			meridian = 'am';
		} else {
			meridian = 'pm';
			hour = (hour % 12);
		}

		if(!hour)
			hour = 12;

		if(!minutes)
			minutes = '00';

		return hour + ':' + minutes + meridian;
	};
});