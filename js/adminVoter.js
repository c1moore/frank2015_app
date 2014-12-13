var frankAdmin = angular.module('frankAdmin', ['mgcrea.ngStrap']);

frankAdmin.controller('votesCtrl', ['$scope', '$timeout',
  function($scope, $timeout) {
    var validator = function() {
      $scope.vote.errors = false;
      $scope.vote.errMess = [];
      
      if(!$scope.vote.name.length) {
        $scope.vote.errors = true;
        $scope.vote.errMess.push("Vote name is required.");
      }
      
      if($scope.vote.option == 1) {
        if(!$scope.vote.hours && !$scope.vote.minutes && !$scope.vote.seconds) {
          $scope.vote.errors = true;
          $scope.vote.errMess.push("Enter when the 'polls' should open for this vote.");
        }
      } else {
        if(!$scope.vote.datetime || $scope.vote.datetime == undefined) {
          $scope.vote.errors = true;
          $scope.vote.errMess.push("Enter when the 'polls' should open for this vote.");
        }
      }
      
      console.log($scope.vote.durationhrs);
      console.log($scope.vote.durationmns);
      console.log($scope.vote.durationsec);
      if(!$scope.vote.durationhrs && !$scope.vote.durationmns && !$scope.vote.sec) {
        $scope.vote.errors = true;
        $scope.vote.errMess.push("Enter how long this vote should last after opening.");
      }
      
      if(!$scope.vote.question.length) {
        $scope.vote.errors = true;
        $scope.vote.errMess.push("Question is required!");
      }
      
      if($scope.vote.answers.length < 2) {
        $scope.vote.errors = true;
        $scope.vote.errMess.push("At least 2 answers are required.");
      }
      
      for(var i=0; i<$scope.vote.answers.length; i++) {
        if(!$scope.vote.answers[i].text.length) {
          $scope.vote.errors = true;
          $scope.vote.errMess.push("Answers cannot be blank.");
          break;
        }
      }
    };
    var intsToMilliseconds = function(hrs, min, sec, ms) {
        hrs = hrs || 0;
        min = min || 0;
        sec = sec || 0;
        ms = ms || 0;
        return (hrs * 3600000) + (min * 60000) + (sec * 1000) + ms;
    };
    
    $scope.votes = [
      {name : 'Research Prize', winner : 'Calvin Moore', start : parseInt(Date.now()+30000), duration : 30000, options : [{choice : 'A', percent : 50}, {choice : 'B', percent : 15}, {choice : 'C', percent : 25}, {choice : 'D', percent : 10}]},
      {name : 'Research Prize', winner : 'Calvin Moore', start : parseInt(Date.now()+300000), duration : 120000, options : [{choice : 'A', percent : 10}, {choice : 'B', percent : 10}, {choice : 'C', percent : 10}, {choice : 'D', percent : 10}, {choice : 'E', percent : 10}, {choice : 'F', percent : 10}, {choice : 'G', percent : 10}, {choice : 'D', percent : 10}, {choice : 'D', percent : 10}, {choice : 'D', percent : 10}]},
      {name : 'Research Prize', winner : 'Calvin Moore', start : parseInt(Date.now()-60000), duration : 120000, options : [{choice : 'A', percent : 20}, {choice : 'B', percent : 30}, {choice : 'C', percent : 10}, {choice : 'D', percent : 40}]},
      {name : 'Research Prize', winner : 'Calvin Moore', start : parseInt(Date.now()-600000), duration : 120000, options : [{choice : 'A', percent : 50}, {choice : 'B', percent : 15}, {choice : 'C', percent : 25}, {choice : 'D', percent : 10}]}
    ];
    
    $scope.progressClasses = ["progress-bar-success progress-bar-striped active", "progress-bar-info progress-bar-striped active", "progress-bar-warning progress-bar-striped active", "progress-bar-danger  progress-bar-striped active", "progress-bar-striped active", "progress-bar-success progress-bar-striped", "progress-bar-warning progress-bar-striped", "progress-bar-danger progress-bar-striped", "progress-bar-striped", "progress-bar-success", "progress-bar-info", "progress-bar-warning", "progress-bar-danger", ""];
    $scope.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    
    $scope.vote = {};
    $scope.vote.name = "";
    $scope.vote.option = 1;
    $scope.vote.question = "";
    $scope.vote.answers = [{text : "", id : 'A'}, {text : "", id : 'B'}];
    $scope.vote.placeholders = ["Yes", "Of Course"];
    
    $scope.vote.errors = false;
    $scope.vote.errMess = [];
    
    $scope.addAnswer = function() {
      $scope.vote.answers.push({text : "", id : $scope.alphabet[$scope.vote.answers.length]});
      $scope.vote.placeholders.push("Answer " + $scope.alphabet[$scope.vote.answers.length-1]);
      console.log($scope.vote.answers);
      console.log();
      console.log($scope.vote.placeholders);
    }
    
    $scope.removeAnswer = function(index) {
      $scope.vote.answers.splice(index, 1);
      for(var i=0; i<$scope.vote.answers.length; i++) {
        $scope.vote.answers[i].id = $scope.alphabet[i];
      }
      
      $scope.vote.placeholders.splice($scope.vote.placeholders.length-1, 1);
      console.log($scope.vote.answers);
      console.log();
      console.log($scope.vote.placeholders);
    }
    
    $scope.resetForm = function() {
      $scope.vote = {};
      $scope.vote.option = 1;
      $scope.vote.question = "";
      $scope.vote.answers = [{text : "", id : 'A'}, {text : "", id : 'B'}];
      $scope.vote.placeholders = ["Yes", "Of Course"];
    }
    
    $scope.enoughAnswers = function() {
      return $scope.vote.answers.length > 1;
    }
    
    $scope.createVote = function() {
      validator();
      if(!$scope.vote.errors) {
        var newVote = {};
        newVote.name = $scope.vote.name;
        newVote.winner = "";
        if($scope.vote.option === 1) {
          newVote.start = Date.now() + intsToMilliseconds($scope.vote.hours, $scope.vote.minutes, $scope.vote.seconds);
          console.log(newVote.start);
        } else {
          newVote.start = new Date($scope.vote.datetime).getTime();
        }
        newVote.duration = intsToMilliseconds($scope.vote.durationhrs, $scope.vote.durationmns, $scope.vote.durationsec);
        newVote.options = [];
        for(var i=0; i<$scope.vote.answers.length; i++) {
          newVote.options.push({choice : $scope.vote.answers[i].id, percent : 0});
        }
        
        $scope.votes.push(newVote);
        $scope.resetForm();
      }
    }
  }
]);

frankAdmin.filter('millisToTime', function() {
  return function(milliseconds) {
    milliseconds = parseInt(milliseconds);
    var hours = Math.floor(milliseconds/3600000);
    milliseconds = (milliseconds%3600000);
    var minutes = Math.floor(milliseconds/60000);
    milliseconds = (milliseconds%60000);
    var seconds = Math.floor(milliseconds/1000);
    milliseconds = (milliseconds%1000);
    
    var time = '';
    if(hours > 0) {
      time = hours + ":";
    }
    
    if(minutes > 9) {
      time += minutes;
    } else {
      time += '0' + minutes;
    }
    
    time += ":";
    
    if(seconds > 9) {
      time += seconds;
    } else {
      time += '0' + seconds;
    }
    
    if(time === "00:00" && milliseconds === 0) {
      time = "Closed";
    }
    
    return time;
  }
});

frankAdmin.directive('countdown', ['$timeout',
  function($timeout) {
    var countdownDefinition = {
      restrict: 'E',
      scope: {
        start : '@startTime',
        duration : '@'
      },
      template: '<div class="frank-app-countdown">' +
                  '{{remaining | millisToTime}}' +
                '</div>',
      link: function postLink(scope, element, attrs) {
        var countdown = function() {
          $timeout(function() {
            scope.remaining = scope.duration-(Date.now()-scope.start);
            if(scope.remaining >= 10)
              countdown();
            else
              scope.remaining = 0;
          }, 10);
          
          //When the timer reaches 10 seconds, make text red.
          if(scope.remaining <= 10999 && scope.remaining >=10899) {
            angular.element(element).addClass("text-error");
          }
        };
        
        $timeout(function() {
          scope.remaining = scope.duration;
          if(scope.start-Date.now() > 0) {
            $timeout(countdown, scope.start-Date.now());
          } else if(-scope.remaining < (scope.start-Date.now())) {
            scope.remaining = -(scope.start-Date.now());
            countdown();
          } else {
            scope.remaining = 0;
            angular.element(element).addClass("text-error");
          }
        }, 0);
      }
    };
    
    return countdownDefinition;
  }
]);