'use strict';

myApp.controller( "SessionsReportControl", function($scope, $rootScope, $timeout, $q, $http,$location, safeApply, ngTableParams, dbService) {

/*
$scope.$watch("dbIsReady", function(newValue, oldValue, scope) {
   
    if (newValue != oldValue) {
        console.log("reloading table");
        $timeout( function() {$scope.tableParams.reload()}, 0 );
    }
})
*/

/*

            $scope.tableParams = new ngTableParams({
            page:   1,                  // show first page
            count: 10                   // count per page
        }, {
            total: function() { return $scope.sessions.length; }, // length of data

            getData: function($defer, params) {
                console.log("Get Data");
                    var mydata = $scope.sessions;
                    if (mydata == undefined)
                        mydata = [];

                    $defer.resolve(mydata.slice((params.page() - 1) * params.count(), params.page() * params.count()));
              //      else
                //        $defer.reject();
            },

            $scope: { $data: {} }

        });
*/
});




/*
$scope.session = [];
            $scope.tableParams = new ngTableParams({
            p: 1,              // show first page
            count: 10                   // count per page
        }, {
           // total: $scope.sessions.length,     // length of data
            total: 600,
            getData: function($defer, params) {
                   // params.total(data.length);
                    $defer.resolve($scope.sessions.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }

        });
*/