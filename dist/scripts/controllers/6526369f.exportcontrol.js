'use strict';

myApp.controller( "ExportControl", function($scope, dbService) {

    ////////////////////////////////////////////////////////////////
    $scope.$on("sessionDataChanged", function() {
//        console.log("Updating Export Data");
  //      $scope.sessions = $scope.sessions || {};
//    	$scope.sessions.csv = dbService.sessionsToCSV();
//    	console.log("csv: ", $scope.sessions.csv );
    });
});
