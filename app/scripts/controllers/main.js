'use strict';

function MainCtrl($scope, $q, $http, $location, dbService) {

    $scope.dbService = dbService;
    dbService.initialize();

    $scope.saveSession = function() {
        console.log("save session");
        dbService.addSessionAndTrials( null, null );
    }

    // Display Message
    $scope.displayMessage = function(message) {
      $window.alert(message)
    }
};

var mainCtrl = angular.module('MainCtrl', []);


