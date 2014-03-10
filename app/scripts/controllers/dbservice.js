'use strict';

myApp.service("dbService", function($location,$q,safeApply,$rootScope) {

	var client;
    var datastore = null;
    var sessionTable = null;
    var self = this;

	////////////////////////////////////////////////////////////////////////////
    this.initialize = function() {
		// Do this by itself so that we can do a isAuthenticated() check without actually authorizing
	    client = new Dropbox.Client({key: '46tjf8x15q98xic'});

	    this.authenticate({interactive: false});
    }  
	////////////////////////////////////////////////////////////////////////////
	this.isAuthenticated = function() {
    	return client.isAuthenticated();
    }
    ////////////////////////////////////////////////////////////////////////////
	this.isDatastoreOpen = function() {
		//console.log("isDatastoreOpen:", !(datastore === null) );
		return !(datastore === null);
	}

	////////////////////////////////////////////////////////////////////////////
	this.authenticate = function(options) {

		// Try to finish OAuth authorization.
		client.authenticate(options, function (error) {
		    if (error) {
		        console.log('Authentication error: ' + error);
		    }
		});

   		if (client.isAuthenticated()) {

			client.getDatastoreManager().openDefaultDatastore(function (error, _datastore) {
	    		if (error) {
	       		 	console.log('Error opening default datastore: ' + error);
	    		}
	    		datastore = _datastore;
	    		console.log('completed openDefaultDatastore');

	    		sessionTable = datastore.getTable('session');

// In this callback, how to call a 'this" function? 

	    		self.subscribeRecordsChanged( function(records) {
    				console.log('a session record has changed: ', records );
    			}, 'session' );

                self.subscribeRecordsChanged( function(records) {
    				console.log('a trial record has changed: ', records );
    			}, 'trial' );
	    	});
	    }				
  	}
    /////////////////////////////////////////////////////////////////////
    var datastoreEventHandler = function(callback){
        return function(arr){
            safeApply($rootScope, function(){
                callback(arr);
            });
        }
    }
    /////////////////////////////////////////////////////////////////////
    this.subscribeRecordsChanged = function(callback, tableid){
        var fn = function(){};
        if(tableid){
            fn = datastoreEventHandler(function(event){
                var records = event.affectedRecordsForTable(tableid);
                callback(records);
            });
        }
        else{
            fn = datastoreEventHandler(callback);
        }

        datastore.recordsChanged.addListener(fn);
        return fn;
    }

// Add session ///////////////////////////////////////////////////////////////////
    this.addSession = function( session ) {
    	console.log('add a session record')
    	sessionTable = datastore.getTable('session');

    	var sessionAdded = sessionTable.insert({
                        description: "Description",
                        starttime: new Date,
                        endtime: new Date,
                        minlatency: 100,
                        maxlatency: 200,
                        durationmsec: 4
                    });
    /*
    	var sessionAdded = sessionTable.insert({
                        description: session.description,
                        starttime: session.starttime,
                        endtime: session.endtime,
                        minlatency: session.minlatency,
                        maxlatency: session.maxlatency,
                        durationmsec: session.durationsec
                    });
  */
    }

    // Add trial(s)
    this.addTrials = function( trials ) {
    	console.log('add the trials');
    }

    // Add session and trials (wrapped in a transaction?)
    this.addSessionAndTrials = function( session, trials ) {
    	console.log( 'add a session and its trials');
    	this.addSession( {} );
    	this.addTrials( trials );
    }

    ////////////////////////////////////////////////////////////////////////////
    // Navigate to a route but check for authentication first and authenticate if not
    this.authenticatedNavigate = function( url ) {
        if (this.isAuthenticated() == true)
            $location.path(url);
        else
            this.authenticate();
    }
    ////////////////////////////////////////////////////////////////////////////
    function basicDeferredCallback(deferred, cmdName){
        return function(err, res){
            safeApply($rootScope,function() {
                if (err) {
                    console.log('dbService "'+cmdName+'" returned error', err);
                    deferred.reject(err)
                } else {
                    console.log('dbService "'+cmdName+'" returned successfully', res);
                    deferred.resolve(res)
                }
            });
        }
    }
	////////////////////////////////////////////////////////////////////////////
    this.signout = function(){
        
        datastore = null;
 
        if (this.isAuthenticated() == false) {
        	console.log("not authenticated, signing out");
			$location.path( "/signout" );
        }
        else {
	        new function(){ 
	        	var deferred = $q.defer();
	    	    client.signOut({mustInvalidate: true}, basicDeferredCallback(deferred, 'signOut'));
	        	return deferred.promise;
	        }().then(function() {
	        	// Success
	        	console.log("signing out");
	        	$location.path("/signout");
	        }, function() {
	        	// Failure - still redirect to signout page
	        	console.log("Error signing out");
	        	$location.path("/signout");
	        });
		}  
    } // End of signout
    ////////////////////////////////////////////////////////////////////////////    
	});

myApp.factory('safeApply', [function($rootScope) {
        return function($scope, fn) {
            var phase = $scope.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if (fn) {
                    $scope.$eval(fn);
                }
            } else {
                if (fn) {
                    $scope.$apply(fn);
                } else {
                    $scope.$apply();
                }
            }
        }
    }]);

