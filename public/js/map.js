var frankAppMap = angular.module('frankAppMap', ['ngFitText', 'frank2015', 'ngMap']);

frankAppMap.controller('mapCtrl', ['$scope', 'localStorageService', '$window', '$timeout',
	function($scope, localStorageService, $window, $timeout) {
		$scope.storage = localStorageService;
		$scope.userLoc = false;
		$scope.lat = 0;
		$scope.lng = 0;
		$scope.showHipp = true;
		$scope.showWooly = false;
		$scope.showBDP = false;
		$scope.showHampton = false;
		$scope.trackUser = true;

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

		$scope.getMapHeight = function() {
			return $window.innerHeight - parseInt(angular.element("#header").css('height'), 10) - parseInt(angular.element("#marker_selector").css('height'), 10);
		};

		$scope.crosshairs = {
			url : '../img/map_crosshairs_32x32.png',
			size : new google.maps.Size(32, 32),
			origin : new google.maps.Point(0, 0),
			anchor : new google.maps.Point(16, 16)
		};

		// $scope.crosshairs = {
		// 	url : '../img/map_crosshairs_32x32.png',
		// 	size : [32, 32],
		// 	origin : [0, 0],
		// 	anchor : [16, 16]
		// };

		var setLocation = function(position) {
			$scope.userLoc = true;
			$scope.$apply(function() {
				$scope.lat = position.coords.latitude;
				$scope.lng = position.coords.longitude;
			});
		};

		$scope.$on('mapInitialized', function(event, map) {
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(setLocation);
				navigator.geolocation.watchPosition(setLocation, null, {enableHighAccuracy : true, timeout : 180000});
			}
		});

		//Update which markers are displaying when user chooses location in markerSelector.
		$scope.updateMarkers = function(id) {
			var show = false;

			switch (id) {
				case "bdp_iw":
					show = $scope.showBDP;
					break;
				case "hamp_inn_iw":
					show = $scope.showHampton;
					break;
				case "hipp_iw":
					show = $scope.showHipp;
					break;
				case "wooly_iw":
					show = $scope.showWooly;
					break;
				case "reset_all":
					$timeout(function() {
						angular.forEach($scope.map.infoWindows, function(value, key) {
							if(key !== "hipp_iw") {
								$scope.map.infoWindows[key].close();
							}
						});
					}, 0);
					return;
				default:
					return;
			}

			show ? $scope.map.infoWindows[id].setMap($scope.map) : $scope.map.infoWindows[id].close();
		};

		$timeout(function() {$scope.updateMarkers('reset_all');}, 0);

		//If the user closes the infoWindow, update the markerSelector.
		$scope.infoClosed = function() {
			switch (this.id) {
				case "bdp_iw":
					$scope.showBDP = false;
					break;
				case "hamp_inn_iw":
					$scope.showHampton = false;
					break;
				case "hipp_iw":
					$scope.showHipp = false;
					break;
				case "wooly_iw":
					$scope.showWooly = false;
					break;
				default:
					return;
			}
		};

		var deregisterLatWatcher;
		var deregisterLngWatcher;
		$scope.getMapCenter = function() {
			if($scope.trackUser && !deregisterLatWatcher) {		//Only register watches if they have not already been registered.
				deregisterLatWatcher = $scope.$watch('lat', function() {
					$scope.getMapCenter();
				});
				deregisterLngWatcher = $scope.$watch('lng', function() {
					$scope.getMapCenter();
				});
			}

			$scope.mapCenter = $scope.lat + ", " + $scope.lng;
		};

		//Stop tracking the user, deregister the lat and lng watchers, and set the deregistration functions to null.
		$scope.stopTracking = function() {
			$scope.trackUser = false;
			if(deregisterLatWatcher) {
				deregisterLatWatcher();
				deregisterLatWatcher = null;
			}
			if(deregisterLngWatcher) {
				deregisterLngWatcher();
				deregisterLngWatcher = null;
			}
		};

		//Set trackUser to true and call getMapCenter to set the user's location and watchers.
		$scope.startTracking = function() {
			$scope.trackUser = true;
			$scope.getMapCenter();
		};

		//Determine whether to call stopTracking or startTracking.
		$scope.toggleTracking = function() {
			if($scope.trackUser) {
				$scope.stopTracking();
			} else {
				$scope.startTracking();
			}
		}

		//Set the center of the map.
		$timeout(function() {$scope.getMapCenter();}, 0);
	}
]);