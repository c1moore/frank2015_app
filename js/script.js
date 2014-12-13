// Code goes here

var participants = angular.module('participants', ['angular-carousel']);

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


var sidebar = angular.module('sidebar', ['snap']);

  sidebar.config(function(snapRemoteProvider) {
    snapRemoteProvider.globalOptions = {
      disable : 'right',
      tapToClose : true,
      touchToDrag : false
    };
  });


var appWindow = angular.module('appWindow', []);

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


var frankAppModule = angular.module('frank2015', ['participants', 'sidebar', 'appWindow', 'ngFitText']);