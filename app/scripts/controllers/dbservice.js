'use strict';

myApp.service("dbService", function($location,$q,dropstoreClient) {

	var dropstoreService = null;
    //var dropstoreService = dropstoreClient.create({key:  '46tjf8x15q98xic'}).authenticate(false);
    var _datastore = null;
    // Defaults to not authenticated until proven otherwise
    var isAuthenticated = false;

	////////////////////////////////////////////////////////////////////////////
    this.initialize = function() {

    	//dropstoreService = dropstoreClient.create({key:  '46tjf8x15q98xic'}).authenticate(false);

		// Do this by itself so that we can do a isAuthenticated() check without actually authorizing
	    dropstoreService = dropstoreClient.create({key:  '46tjf8x15q98xic'}); 
 //dropstoreService = dropstoreClient.create({key:  '46tjf8x15q98xic', secret: '9iks11gdn0zihao',
//	    	token: 'BdQpuyHNrPEAAAAAAAAAAZS9kgFY9GLb0Lw288PjmFFmCQyENAaqvpW5ic8Ww8lL'}); 



// 5BaOdPohRMYAAAAAAAAAAUP5BsBTO849tefdWZISLVNEgztyJQiPqnHkWEdLSRb


	    // NON-interactive authenticase upon page load
//	    if (dropstoreService.isAuthenticated() == false) {
	       // isAuthenticated = false;
	        this.authenticate(false);
//	    }
    }  
	////////////////////////////////////////////////////////////////////////////
	this.isAuthenticated = function() {
    	return dropstoreService.isAuthenticated();
    }
    ////////////////////////////////////////////////////////////////////////////
	this.isDatastoreOpen = function() {
		if (_datastore === null)
			return false
		else
			return true
	}

	////////////////////////////////////////////////////////////////////////////
	this.authenticate = function(interactive) {
	//	console.log("dbService: authenticate: isAuthenticated:", isAuthenticated);
  
        // Defaults to true
        interactive = typeof interactive !== 'undefined' ? interactive : true;

        console.log("MainCtrl.authenticate(interactive: ", interactive, ")" );
  
  		// Called when session records change
    	this.sessionRecordsChanged = function(records) {
    		console.log('a record has changed');
    	}
   
        dropstoreService
            .authenticate({interactive: interactive})
            .then(function(result){
            	console.log("authenticate:result: ", result );
            	var datastoreManager = dropstoreService.getDatastoreManager();
                isAuthenticated = true;
                return datastoreManager.openDefaultDatastore();
                }, 
                function(reason) {
                	console.log('Authentication Failed: ' + reason);
                }
            ) 
            .then(
                function(datastore){
                    console.log('completed openDefaultDatastore',datastore);
                    _datastore = datastore;

                   _datastore.SubscribeRecordsChanged( function(records) {
    					console.log('a session record has changed: ', records );
    				}, 'session' );

                    _datastore.SubscribeRecordsChanged( function(records) {
    					console.log('a trial record has changed: ', records );
    				}, 'trial' );
  
                }
            )   
        }

    // Add session
    this.addSession = function( session ) {
    	console.log('add a session record')
    	var sessionTable = _datastore.getTable('session');

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
    this.signout = function(){
        console.log('dbService: in the controller signout: isAuthenticated:', isAuthenticated, " dropstoreClient:", dropstoreClient);

 //       if (isAuthenticated == false) {
    //        console.log('dbService: signout: user was already signed out.: isAuthenticated:', isAuthenticated );   
//        }
        
  //      if ((isAuthenticated == true) || (dropstoreClient.isAuthenticated() == true)) {
  //           console.log("dbService: signout: inconsistency in authentication state");
  //          isAuthenticated = false;
            _datastore = null;
  //      }

        if (dropstoreClient.isAuthenticated() == false) {
            // Don't try to to do the dropstoreClient signout cause it won't work anyway
//            console.log("dbService: dropstoreClient says already signed out so not going to try it again.");
			$location.path( "/signout" );
        }

      	dropstoreClient.signOut({mustInvalidate: true})
      	.then(
        function(){
 //           console.log('dbService: signout: successful: isAuthenticated:', isAuthenticated);
            isAuthenticated = false;
            _datastore = null;
            $location.path( "/signout" );
        }, 
        function(error){
 //           console.log('dbService: signout: failure: isAuthenticated:', isAuthenticated);
            $location.path( "/signout" );
            _datastore = null;
            // Go to a signup failure (try again?) page. 
        }
      );
    } // End of signout
    ////////////////////////////////////////////////////////////////////////////
    
	});

