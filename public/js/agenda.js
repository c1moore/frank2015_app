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
		$scope.halfHrIntervals = ["", "1am", "", "2am", "", "3am", "", "4am", "", "5am", "", "6am", "", "7am", "", "8am", "", "9am", "", "10am", "", "11am", "", "12pm", "", "1pm", "", "2pm", "", "3pm", "", "4pm", "", "5pm", "", "6pm", "", "7pm", "", "8pm", "", "9pm", "", "10pm", "", "11pm", ""];

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

		/**
		* Returns the width of that an hourly event should have.  The width is the width
		* of the screen minus the widths of two all day events minus a 10px margin
		* between each element minus a 10px margin for the right of the hourly event. If
		* this is a Huddle, the width should be half the size of a normal element to
		* allow for another block for office hours right beside it.
		*/
		$scope.hourlyWidth = function(name) {
			var hourlyWidth = $window.innerWidth - $scope.hourlyLeftPos - 55;	//The entire width of the screen minus the width of all-day events (times two as there should not be more than 2) minus the left-margin for all-day events (time 2 as there should not be more than 2) minus the margin between all-day and hourly events minus the right-margin of hourly events (including the scrollbar).

			if(name === 'Huddles')
				hourlyWidth *= .5;

			return hourlyWidth;
		}

		$scope.officeHrsLeftPos = $scope.hourlyLeftPos + $scope.hourlyWidth('Huddles');

		/**
		* Returns the header of a given carousel item.  The header has the format
		* "M/D/YY (Day `index`)".
		*/
		$scope.getHeader = function(index) {
			var date = new Date(($scope.millisInDay * index) + $scope.startDate);
			return date.toLocaleDateString() + ' (Day ' + index + ')';
		};

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
		* Returns the number of days into the frank 2015.
		*/
		$scope.daysSinceStart = function() {
			var x = (Date.now() - $scope.startDate) / $scope.millisInDay;
			return (x>=0) ? x : 0;
		};

		$scope.day = $scope.daysSinceStart();		//Set the index for the carousel.

		$scope.timeBarTop = 0;
		$scope.time = null;
		/**
		* Sets timeBarTop, which represents the value of the CSS property top.  This function also has a
		* timeout to repeatedly call this function so the timebar moves with the time.
		*/
		$scope.setTimeBarTop = function() {
			var currTime = new Date(Date.now());
			var midnight = Date.parse(new Date(currTime.getFullYear(), currTime.getMonth(), currTime.getDate(), 0, 0, 0));

			$scope.timeBarTop = Math.floor(((currTime - midnight) / (60 * 1000)) * $scope.pixelMinuteRatio) - 21;
			$scope.time = Date.parse(currTime);

			$timeout(function() {$scope.setTimeBarTop();}, 1000);		//Update every 1 second.
		};

		$scope.setTimeBarTop();

		/**
		* Set the page to initially scroll so that the time-bar is in the center of the page.
		*/
		var setPageScrollTop = function() {
			$timeout(function() {
				document.getElementsByClassName("calendar-carousel")[0].scrollTop = $scope.timeBarTop - ($window.innerHeight * .5);
			}, 0);
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
			setPageScrollTop();

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

		if(minutes < 9)
			minutes = '0' + minutes;

		return hour + ':' + minutes + meridian;
	};
});

frankAgenda.directive('marker', function($timeout) {
	var markerDefinition = {
		restrict : 'E',
		scope : {
			halfHrIntervals : '=',
			currentIndex: '='
		},
		template : "<div class=\"marker\">{{halfHrIntervals[currentIndex]}}</div>",	// ng-style=\"{top : getMarkerPosition(currentIndex)}\"
		link : function postLink(scope, element, attrs) {
			/**
			* Return the value for the CSS top value of each half-hour marker.  In order to position
			* the marker correctly, the height needs to be subtracted from the position.
			*/
			/*scope.getMarkerPosition = function() {
				$timeout(function() {
					console.log(element.css('height'));
					var topValue = ((scope.currentIndex + 1) * 60) - parseInt(element.css('height'), 10);
					element.css({'top' : topValue});
				});
			};

			scope.$watch(function() {return element.css('height');}, scope.getMarkerPosition);*/
		}
	};

	return markerDefinition;
});