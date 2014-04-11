'use strict';

myApp.controller( "SessionController", function($scope, $rootScope, $location, $stateParams,
	safeApply, ngTableParams, dbService) {

	var sessions = $scope.dbService.sessions();
	if (sessions) 
		$scope.session = sessions.findOne({index: Math.round($stateParams.index) });
  
  //console.log("StateParams:", $stateParams );

    $scope.$on("sessionDataChanged", function() {
    	console.log("Updating SESSION chart: ", $stateParams.index );
		// Get it from the database and stick it into the scope as "session" 
		var sessions = $scope.dbService.sessions();
		$scope.session = sessions.findOne({index: Math.round($stateParams.index) });
		if ($scope.session) {
    		console.log("Found it");
    	}
    });
	
});
