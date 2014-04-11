'use strict';

myApp.controller("ReactionTimeCtrl", function($scope, ReactionTimeSession) {

	$scope.test = new ReactionTimeSession;  

	$scope.session = {
    	notes: null // This should be initialized from the last session completed (or should it?)
  	}; 


// Supposedly disabled scroll bounce
// 	document.body.addEventListener('touchmove',function(event){
//  	event.preventDefault();
//	});

  	$scope.test.saveNotes = function() {
  		$scope.test.setNotes($scope.session.notes);
  	}

	$scope.test.hello = function(myname) {
		var result; // = ocpuRPC.hello(myname);
		result.then( function(result) {
			$scope.test.message = result.message[0];
			console.log("result.message[0]:", result.message[0], " result:", result );
		}, function (status) {
			console.log("hello status:", status );
		});
	};	

	$scope.test.saveTrials = function() {
		var trials = this.trials;
		var result; //ocpuRPC.saveTrials(trials);
		result.then( function(result) {
			// Since the save was successful then we need to clear out the
			// session info and display a message to user saying it was succesful. 
			// $scope.test.resetSession();
			console.log("saveTrials:", result );
		}, function (status) {
			console.log("saveTrials status:", status );
		});
	};
	
    return $scope.test;
});


