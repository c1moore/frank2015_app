/**
* Directives, controllers, and configurations that will be commonly used
* throughout the app will be defined in this file.
*/
var appWindow = angular.module('appWindow', ['snap']);

	appWindow.config(function(snapRemoteProvider) {
		snapRemoteProvider.globalOptions = {
			disable : 'right',
			tapToClose : true,
			touchToDrag : false
		};
	});

	appWindow.directive('resizable', function ($window) {
		function resize(scope, elems, attrs) {
			var checkOrientation = function() {
				if($window.innerWidth > $window.innerHeight)
					scope.portrait = false;
				else
					scope.portrait = true;
			};
				
			var changeMBMargin = function() {
				var winH = $window.innerHeight;
				if(winH*.1>50) {
					if(winH*.05 > 44) {
						var margin = ((winH*.1)-(winH*.05))/2;
						scope.mBMargin = margin + 'px';
					} else {
						var margin = ((winH*.1)-44)/2;
						scope.mBMargin = margin + 'px';
					}
				} else {
					scope.mBMargin = '3px';
				}
			};
			
			var checkMinSize = function() {
				if($window.innerHeight*.1<50) {
					scope.smallSize = true;
				} else {
					scope.smallSize = false;
				}
			};
		
			var setSideContent = function() {
				if(!scope.portrait) {
					var winW = $window.innerWidth;
					var winH = $window.innerHeight;
					scope.sideContent = ((winW*.75)-(winH*.55)-30) + 'px';
				} else
					scope.sideContent = 'auto';
			}
			
			checkOrientation();
			changeMBMargin();
			checkMinSize();
			setSideContent();
			
			angular.element($window).on('resize', function () {
				checkOrientation();
				changeMBMargin();
				checkMinSize();
				setSideContent();
			});
		}
					
		return {
			link: resize
		};
	});

	appWindow.directive('header', function() {
		var headerDefinition = {
			restrict : 'E',
			templateUrl : "../view/header.html"
		};

		return headerDefinition;
	});

var frankLocalStorage = angular.module('frankLocalStorage', ['LocalStorageModule']);

frankLocalStorage.config(
	function(localStorageServiceProvider) {
		localStorageServiceProvider
			.setPrefix('frankApp')
			.setStorageType('localStorage')
			.setNotify(true, true);
	}
);


var frankAppModule = angular.module('frank2015', ['frankLocalStorage', 'appWindow']);

frankAppModule.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
});