'use strict';

myApp.controller( "ResultsControl", function($scope, $rootScope, $filter, $timeout, $q, $http,$location, 
	safeApply, ngTableParams, dbService) {

    $scope.refreshResults = function() {
        $rootScope.$broadcast("sessionDataChanged");
    }
	
});
