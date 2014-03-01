'use strict';

describe('Controller: ReactionTimeCtrl', function () {

  // load the controller's module
  beforeEach(module('braintracker'));

  var ReactionTimeCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ReactionTimeCtrl = $controller('ReactionTimeCtrl', {  
      $scope: scope
    });
  }));
  
  it('trialCount should be zero', function () {
    expect(ReactionTimeCtrl.trialCount).toBe(0);
  });

  it('saveSession should return TESTING', function () {
    expect(ReactionTimeCtrl.saveSession()).toBe('TESTING');
  });

  describe('Controller: ReactionTimeCtrl', function () {

    var Trial,results;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
      scope = $rootScope.$new();
      ReactionTimeCtrl = $controller('ReactionTimeCtrl', {  
        $scope: scope
      });
      Trial = ReactionTimeCtrl.start();

      results = angular.fromJson( angular.toJson(Trial,true) );
    }));
  
    it('Trial phase should be waiting', function () {
      expect(Trial.phase).toBe('waiting');
    });

    it('Trial.results.phase json should be waiting', function () {
      expect(results.phase).toBe('waiting');
    });

  });

});



