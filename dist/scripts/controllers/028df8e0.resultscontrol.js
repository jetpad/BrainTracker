'use strict';

myApp.controller( "ResultsControl", function($scope, $rootScope, $filter, $timeout, $q, $http, $location, $state,
	safeApply, ngTableParams, dbService) {

	$scope.range = [undefined,undefined];

	//$scope.tabset.results.chart = $state.current.name
/*
    <tab heading="Latency vs Time Chart" ui-sref="results.chart" active="tabset.results.chart" />
    <tab heading="Percentile vs Time Chart" ui-sref="results.ptilechart" active="tabset.results.ptilechart" />
    <tab heading="Sessions Report" ui-sref="results.report" active="tabset.results.report" />
*/

	//$scope.initialTab = $state.current.name;
/*
	$scope.reportTabSelected = function() {
		$state.go('results.report');
	}

	$scope.chartTabSelected = function() {
		$state.go('results.chart');
	}

	$scope.ptileChartTabSelected = function() {
		$state.go('results.ptilechart');
	}
*/
});
