'use strict';

function MainCtrl($scope, $q, $http, $location, dropstoreClient, dbService, safeApply, recordWrapper) {

    $scope.dbService = dbService;
    dbService.initialize();

    //localStorage.setItem("foo", "bar");

    $scope.getLocalStorage = function() {
        return localStorage.getItem("foo") + localStorage.getItem("dog");
    }

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


