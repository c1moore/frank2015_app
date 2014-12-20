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
			};
			
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

	appWindow.directive('frankHeader', function() {
		var headerDefinition = {
			restrict : 'E',
			templateUrl : "../view/header.html",
			transclude: true
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


var frankAppModule = angular.module('frank2015', ['frankLocalStorage', 'appWindow', 'ngFitText']);

frankAppModule.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
});

frankAppModule.factory('interestsService', [
	function() {
		this.interests = {
			"Arts" : "../img/interests/arts.png",
			"Child Development" : "../img/interests/child_development.png",
			"Conservation" : "../img/interests/conservation.png",
			"Corporate Social Responsibility" : "../img/interests/corporate_social_responsibility.png",
			"Corrections" : "../img/interests/corrections.png",
			"Culture" : "../img/interests/culture.png",
			"Education" : "../img/interests/education.png",
			"Entertainment" : "../img/interests/entertainment.png",
			"Environment" : "../img/interests/environment.png",
			"Food & Health" : "../img/interests/food_&_health.png",
			"frank" : "../img/interests/frank.png",
			"Gender Equality" : "../img/interests/gender_equality.png",
			"Health" : "../img/interests/health.png",
			"Human Rights" : "../img/interests/human_rights.png",
			"Income Disparity" : "../img/interests/income_disparity.png",
			"Inspiration" : "../img/interests/inspiration.png",
			"International Development" : "../img/interests/international_development.png",
			"Media" : "../img/interests/media.png",
			"Mental Health" : "../img/interests/mental_health.png",
			"Music" : "../img/interests/music.png",
			"Politics" : "../img/interests/politics.png",
			"Poverty" : "../img/interests/poverty.png",
			"Religion" : "../img/interests/religion.png",
			"Science" : "../img/interests/science.png",
			"Social Media" : "../img/interests/social_media.png",
			"Solutions Journalism" : "../img/interests/solutions_journalism.png",
			"Special Needs" : "../img/interests/special_needs.png",
			"Technology" : "../img/interests/technology.png",
			"Tobacco" : "../img/interests/tobacco.png",
			"Travel" : "../img/interests/travel.png",
			"Violence Prevention" : "../img/interests/violence_prevention.png",
			"Water" : "../img/interests/water.png"
		};

		return this;
	}
]);