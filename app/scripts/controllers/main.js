'use strict';

myApp.controller( "MainCtrl", function($scope, $rootScope, $q, $http, $location, dbService) {

    $scope.dbService = dbService;
    dbService.initialize().then( function() {
        // If the initial initialize fails then this code needs to be added somewhere else after it trIES AGAIN 
        $scope.sessionRecordCount = dbService.sessionRecordCount;
        $scope.dbReady = dbService.ready;
        $scope.dbIsReady = true;

        var sessionTable = dbService.getDatastore().getTable('session');
       // $scope.sessions = sessionTable.query();

        // Convert dropbox session records into an array of objects
        // and in some way keep link to the original dropbox record
        $scope.sessions = dbService.sessionToObjectArray();

        // Actually, how about an object that inherits or is initialized by the Array<Dropbox.Datastore.Record>
        // that is returned by the query and acts like a normal array and returns getFields when called to get the value of the array item. 
       // console.log("sessions: ", $scope.sessions );

       // console.log("tableParams: ", $rootScope.tableParams );
       // $rootScope.tableParams.reload();
      // $scope.initReport();
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
        var json = JSON.stringify(sessions);

        $scope.json = json;
    
       // $scope.getBlob = function(){
       //     return new Blob([json], {type: "application/json"});
        

        // dbService.addSessions(sessions);
    }
});

//var mainCtrl = angular.module('MainCtrl', []);