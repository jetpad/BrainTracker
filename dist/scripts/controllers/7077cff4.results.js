'use strict';

function ResultsController($scope, $q, $http, $location, dropstoreClient, dbService, safeApply, recordWrapper) {

    $scope.dbService = dbService;

    dbService.initialize();
};

var resultsController = angular.module('ResultsController', []);

