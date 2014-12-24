/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
var mod;

mod = angular.module('infinite-scroll', []);

mod.directive('infiniteScroll', [
	'$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
		return {
			link: function(scope, elem, attrs) {
				var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
				$window = angular.element($window);
				scrollDistance = 0;
				if (attrs.infiniteScrollDistance != null) {
					scope.$watch(attrs.infiniteScrollDistance, function(value) {
						scrollDistance = parseInt(value, 10);
					});
				}
				scrollEnabled = true;
				checkWhenEnabled = false;
				if (attrs.infiniteScrollDisabled != null) {
					scope.$watch(attrs.infiniteScrollDisabled, function(value) {
						scrollEnabled = !value;
						if (scrollEnabled && checkWhenEnabled) {
							checkWhenEnabled = false;
							return handler();
						}
					});
				}
				handler = function() {
					var elementBottom, remaining, shouldScroll, windowBottom;
					windowBottom = $window.height() + $window.scrollTop();
					elementBottom = elem.offset().top + elem.height();
					remaining = elementBottom - windowBottom;
					shouldScroll = remaining <= $window.height() * scrollDistance;
					if (shouldScroll && scrollEnabled) {
						if ($rootScope.$$phase) {
							return scope.$eval(attrs.infiniteScroll);
						} else {
							return scope.$apply(attrs.infiniteScroll);
						}
					} else if (shouldScroll) {
						return checkWhenEnabled = true;
					}
				};

				//Fixes as proposed by Freyskeyd on Github issue here: https://github.com/sroze/ngInfiniteScroll/issues/104
				var applied = false;
				var touchmover = function () {
					if ( ! applied) {
						applied = true;
						$window.on('touchend', handler);
					}
				};

				$window.on('touchmove', touchmover);

				scope.$on('$destroy', function() {
					$window.off('touchend', handler);
					applied = false;
				  return $window.off('touchmove', touchmover);
				});

				//Additions by Calvin Moore to handle when scrolling stops.  It seems that iOS users have to scroll again after reaching the bottom to load more data.
				//Since the scroll event is only fired when the user's finger is removed, I am estimating
				//that it will take at most 1 second for the momentum caused by the scroll to reach the bottom
				//if it will reach the bottom.
				$window.on('scroll', function() {
					$timeout.cancel(scrollStopped);
					scrollStopped = $timeout(handler, 1000);
				})

				/*$window.on('scroll', handler);
				scope.$on('$destroy', function() {
					return $window.off('scroll', handler);
				});*/
				return $timeout((function() {
					if (attrs.infiniteScrollImmediateCheck) {
						if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
							return handler();
						}
					} else {
						return handler();
					}
				}), 0);
			}
		};
	}
]);
