'use strict';

myApp.controller( "MainCtrl", function($scope, $rootScope, $q, $http, $location, dbService) {

    // Redirect to a secure URL if needed
    if (($location.protocol() == "http") && ($location.host() != "localhost")) {
        var newUrl = "https:" + $location.absUrl().substr(5);
        window.location = newUrl;
    }

    $scope.dbService = dbService;
    dbService.initialize().then( function() {
    })

    // Display Message
    $scope.displayMessage = function(message) {
      $window.alert(message)
    }

    $scope.importCSV = function() {
        var trials = dbService.CSVToArray( $scope.content );
        var sessions = dbService.parseTrialstoSessions( trials );

        dbService.backgroundAddSessions(sessions)
        .then( 
        function(importCSV) {
            $scope.importIndex = importCSV.idx;
            $scope.importMax = importCSV.max;
        }, 
        function(error) {},
        function(importCSV) {
            $scope.importIndex = importCSV.idx;
            $scope.importMax = importCSV.max;
        });
    }

    $scope.showContent = function($content){
        $scope.content = $content;

        var trials = dbService.CSVToArray( $scope.content );
        var sessions = dbService.parseTrialstoSessions( trials );

        // Also make the json for downloading
      //  var json = JSON.stringify(sessions);
      //$scope.json = json;
    }
});

//var mainCtrl = angular.module('MainCtrl', []);