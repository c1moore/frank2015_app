var participants = angular.module('participants', ['angular-carousel', 'ngFitText', 'frank2015']);

	participants.controller('ParticipantController', ['$scope', '$http', function($scope, $http) {
		$scope.query = {};
		$scope.queryBy = '$';
		
		$scope.showing = {name : true, email : false, twitter : true, interests : false};
		
		$scope.showColumn = function(column) {
			$scope.showing[column] = true;
		};
		
		$scope.participants = [{image: 'http://www.testically.org/wp-content/uploads/2012/06/web-programming.jpg', name : 'Calvin Moore', email : 'c1moore@ufl.edu', interests : [{alt: 'Tech', image: 'http://frank.jou.ufl.edu/wp-content/uploads/2014/08/technology.png'}, {alt: 'Environ', image: 'http://frank.jou.ufl.edu/wp-content/uploads/2014/08/environment1.png'}, {alt: "Entertainment", image: 'http://frank.jou.ufl.edu/wp-content/uploads/2014/08/entertainment1.png'}]}, {image: 'http://www.testically.org/wp-content/uploads/2012/06/web-programming.jpg', name : 'Another Example', email : 'aexample@email.com', interests : [{alt: 'Travel', image: 'http://frank.jou.ufl.edu/wp-content/uploads/2014/08/travel1.png'}, {alt: 'Conserve', image: 'http://frank.jou.ufl.edu/wp-content/uploads/2014/08/conservation1.png'}, {alt: 'Education', image: 'http://frank.jou.ufl.edu/wp-content/uploads/2014/08/education.png'}]}, {image: 'http://www.testically.org/wp-content/uploads/2012/06/web-programming.jpg', name : 'Calvin Moore', email : 'c1moore@ufl.edu', interests : [{alt: 'Programming', image: ''}, {alt: 'Development', image: ''}, {alt: 'Code', image:''}]}, {image: 'http://www.testically.org/wp-content/uploads/2012/06/web-programming.jpg', name : 'Another Example', email : 'aexample@email.com', interests : [{alt: 'Programming', image: ''}, {alt: 'Development', image: ''}, {alt: 'Code', image:''}]}];
	}]);
	
	
/*var participantTable = angular.module('participantTable', []);
	
	participantTable.controller('PTableController', ['$scope', function($scope) {
		$scope.showing = {name : true, email : true, twitter : false, interests : false};
		
		$scope.showColumn = function(searchby) {
			angular.forEach($scope.showing, function(key, value) {
				if(key === 'name') {
					continue;
				} else {
					$scope.showing[key] = !($scope.showing[key]);
				}
			});
			$scope.showing[searchby] = true;
		};
	}]);*/