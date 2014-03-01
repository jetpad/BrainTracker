'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('braintracker'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {  
      $scope: scope
    });
    scope.name = 'World';
  }));
  
  it('name should be World', function () {
    expect(scope.name).toBe('World');
  });

  it('one plus one should equal two', function () {
    expect(1+1).toBe(2);
  });

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });

});
