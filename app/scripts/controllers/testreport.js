'use strict';

myApp.controller('DemoCtrl', function($scope, $rootScope, $filter, ngTableParams) {
	$scope.datasets = ["1","2"];
	$scope.dataset = "2";
    var data1 = [{notes: "One", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Two", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Three", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Four", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Five", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Six", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Seven", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Eight", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Nine", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Ten", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Eleven", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Twelve", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Thirteen", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Fourteen", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Fifteen", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Sixteen", starttime: '2014-01-23T22:13:18.000Z'}];
	
	var data2 = [{notes: "Jacob", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Jacob", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Nephi", starttime: '2014-01-23T22:13:18.000Z'},
                {notes: "Enos", starttime: '2014-01-23T22:13:18.000Z'}];
	
	var getData = function() {
		return $scope.dataset === "1" ? data1 : $scope.sessions;
	};
	
    $scope.$watch("dataset", function () {
        $scope.tableParams.reload();
    });     

    $scope.$watch("dbReady", function () {
        $scope.tableParams.reload();
    }); 	

    $scope.tableParams = new ngTableParams({
        pstarttime: 1,            // show first page
        count: 10,          // count per page
        sorting: {
            notes: 'asc'     // initial sorting
        }
    }, {
        total: function () { return getData().length; }, // length of data
        getData: function($defer, params) {
            var filteredData = getData();
            var orderedData = params.sorting() ?
                                $filter('orderBy')(filteredData, params.orderBy()) :
                                filteredData;

            params.total(orderedData.length);
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        },
		$scope: { $data: {} }
    });
});
