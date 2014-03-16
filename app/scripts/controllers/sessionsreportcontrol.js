'use strict';

myApp.controller( "SessionsReportControl", function($scope, $rootScope, $filter, $timeout, $q, $http,$location, 
	safeApply, ngTableParams, dbService) {

	$scope.$watch("dbIsReady", function(newValue, oldValue, scope) {   
    	console.log("dbIsReady changed: ", newValue, oldValue, scope );
    	if (newValue != oldValue) {
    		$scope.tableParams.reload();        
    	}
	})

	var getData = function() {
		return ($scope.sessions) ? $scope.sessions : [];
	};
	
	$scope.tableParams = new ngTableParams({
            page:   1,                  // show first page
            count: 10,                // count per page
            sorting: {
            	name: 'asc'     // initial sorting
        	}
        }, {
	        total: function () { return getData().length; }, // length of data
            getData: function($defer, params) {
         	var filteredData = getData();
            var orderedData = params.sorting() ?
                                $filter('orderBy')(filteredData, params.orderBy()) :
                                filteredData;
			params.total(orderedData.length); // set total for recalc pagination
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
		    },

            $scope: { $data: {} }

        });

});
