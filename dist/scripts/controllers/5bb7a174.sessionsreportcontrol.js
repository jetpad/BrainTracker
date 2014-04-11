'use strict';

myApp.controller( "SessionsReportControl", 
    function($scope, $rootScope, $filter, $timeout, $q, $http,$location, safeApply, ngTableParams, dbService) {

    $scope.$on("sessionDataChanged", function() {
 //       console.log("Updating Report");
//        $scope.tableParams.reload();        
    });

    $scope.saveNotes = function(notes,id) {
        console.log("saving session notes: ", notes, " for id: ", id );

        $scope.dbService.updateSessionField( id, "notes", notes );

        // Next line was just enabled to fluffup some back data. 
      //  $scope.dbService.updateSessionField( id, "errorpercent", (Math.round(Math.random()*20) + 1 ) );
        return true;
    }

	var getData = function() {
		return ($scope.dbService.sessions()) ? $scope.dbService.sessions() : [];
	};
	
	$scope.tableParams = new ngTableParams({
            page:   1,                  // show first page
            count: 25,                  // count per page
            sorting: {
            	starttime: 'desc'     // initial sorting
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
