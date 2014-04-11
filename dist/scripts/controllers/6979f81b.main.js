'use strict';

myApp.controller( "MainCtrl", function($scope, $rootScope, $modal, $q, $http, $location, dbService) {

    // Redirect to a secure URL if needed
    if (($location.protocol() == "http") && 
        ($location.host() != "localhost") &&
        ($location.host() != "127.0.0.1") &&
        ($location.host() != "server")) {
        var newUrl = "https:" + $location.absUrl().substr(5);
        window.location = newUrl;
        //console.log("HOST: ", $location.host(), "  PROTOCOL: ", $location.protocol());
    }

    $scope.dbService = dbService;
    dbService.initialize().then( function() {
    })

    // Save the app version number to the scope
    $scope.version = "0.0.1";

    // Display Message
    $scope.displayMessage = function(message) {
      $window.alert(message)
    }
 
    // Test if private browsing is turned on
    try {
        localStorage.reactiontrackertest = 2;// try to use localStorage      
    } catch (e) {//there was an error so...
        //alert('You are in Privacy Mode\nPlease deativate Privacy Mode and the reload the page.');
        $scope.alerts = [];
        $scope.alerts.push({
            type:   "danger", 
            msg:    "You're browser is in Privacy Mode.                                      Privacy Mode must be turned off to use Dropbox."
        });
    }

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

      $scope.addAlert = function() {
    $scope.alerts.push({msg: "Another alert!"});
  };

    $scope.importCSV = function() {
        var trials = dbService.CSVToArray( $scope.content );
        var sessions = dbService.parseTrialstoSessions( trials );

        dbService.backgroundAddSessions(sessions)
        .then( 
        function(importCSV) {
            $scope.importIndex = importCSV.idx;
            $scope.importMax = importCSV.max;

            // Background import is finished. 
            // Show the modal finished dialog 
             var modalInstance = $modal.open({
                templateUrl: 'views/finishedimport.html'
            }); 
            modalInstance.result.then( function() { 
                $location.path("/");
            },function() {
                $location.path("/");
            });    
        }, 
        function(error) {},
        function(importCSV) {
            $scope.importIndex = importCSV.idx;
            $scope.importMax = importCSV.max;
        });
    }

    $scope.showContent = function($content){
        $scope.content = $content;

       // var trials = dbService.CSVToArray( $scope.content );
       // var sessions = dbService.parseTrialstoSessions( trials );

        // Also make the json for downloading
      //  var json = JSON.stringify(sessions);
      //$scope.json = json;
    }
});

//var mainCtrl = angular.module('MainCtrl', []);