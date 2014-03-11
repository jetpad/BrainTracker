'use strict';

myApp.service("dbService", function($location,$q,safeApply,$rootScope) {

	var client;
    var datastore = null;
    var datastoreManager = null;
    var sessionTable = null;
    var trialTable = null;
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
	this.getDatastore = function() {
		return datastore;
	}
	////////////////////////////////////////////////////////////////////////////
	this.deleteDatastore = function( datastoreId ) {
		var deferred = $q.defer();
        datastoreManager.deleteDatastore( datastoreId, basicDeferredCallback(deferred, 'deleteDatastore') );
        return deferred.promise;
	}	////////////////////////////////////////////////////////////////////////////
	this.createDatastore = function() {
		var deferred = $q.defer();

        datastoreManager.createDatastore( function(error, _datastore) {
        	safeApply($rootScope, function() {
	        	if (error) {
	        		console.log('Error creating datastore: ' + error); 
	        		deferred.reject(error);
	        	}
	        	else {
	        		console.log("successfully created new datastore");
	        		datastore = _datastore;
	        		deferred.resolve(_datastore); 
	        	}
	    	})
	    } );
        return deferred.promise;    
	}
	////////////////////////////////////////////////////////////////////////////
	this.openDefaultDatastore = function() {
		var deferred = $q.defer();

		// If it is already open then return
		if (this.isDatastoreOpen()) {
			if (datastore.getId() == "default") {
				deferred.resolve(datastore);
				return deferred.promise;
			}
		}

        datastoreManager.openDefaultDatastore( function(error, _datastore) {
        	safeApply($rootScope, function() {
	        	if (error) {
	        		console.log('Error opening default datastore: ' + error); 
	        		deferred.reject(error);
	        	}
	        	else {
	        		//console.log("successfully opened default datastore");
	        		datastore = _datastore;
	        		deferred.resolve(_datastore); 
	        	}
	    	})
	    } );
        return deferred.promise;    
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

			datastoreManager = client.getDatastoreManager();

			this.openDefaultDatastore().then( 
				function(_datastore) {
					self.openTables();
				}, 
				function(error){
					console.log('Error opening default datastore: ' + error);
			    }
			);
	    }				
  	}
  	/////////////////////////////////////////////////////////////////////
  	this.openTables = function() {
		sessionTable = datastore.getTable('session');
	    trialTable = datastore.getTable('trial');

		this.subscribeRecordsChanged( function(records) {
			console.log('a session record has changed: ', records );
		}, 'session' );

        this.subscribeRecordsChanged( function(records) {
			console.log('a trial record has changed: ', records );
		}, 'trial' );
	}
  	/////////////////////////////////////////////////////////////////////
  	this.close = function() {
  		datastoreManager.close();
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
	////////////////////////////////////////////////////////////////////////////  
	this.addSessions = function(sessions) {
		for(var i=0; i < sessions.length; i++){
			this.addSession(sessions[i]);
		}
	}
	//////////////////////////////////////////////////////////////////////////////
	this.addTrials = function(sessionId, trials) {

		for(var i=0; i < trials.length; i++){
			this.addTrial(sessionId, trials[i]);
		}
	}
	/////////////////////////////////////////////////////////////////////
    this.addTrial = function( sessionId, trial ) {
    }
    /////////////////////////////////////////////////////////////////////
    this.addSession = function( session ) {
    	// Start transaction

    	var sessionRecord = sessionTable.insert({
                        notes: 			session.notes,
                        starttime: 		session.starttime,
                        endtime: 		session.endtime,
                        minlatency: 	session.minlatency,
                        maxlatency: 	session.maxlatency,
                        testtype: 		session.testtype,
                        testversion: 	session.testversion,
                        delay: 		    session.delay,
                        duration:       session.duration
                    });

    	// Insert the trial records along with a sessionRecord id
    	this.addTrials( sessionRecord.getId(), trials );

    	// End transaction
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
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    this.CSVToArray = function( strData, strDelimiter ){
    	// Check to see if the delimiter is defined. If not,
    	// then default to comma.
    	strDelimiter = (strDelimiter || ",");

    	// Create a regular expression to parse the CSV values.
    	var objPattern = new RegExp(
    		(
    			// Delimiters.
    			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

    			// Quoted fields.
    			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

    			// Standard fields.
    			"([^\"\\" + strDelimiter + "\\r\\n]*))"
    		),
    		"gi"
    		);

    	// Create an array to hold our data. Give the array
    	// a default empty first row.
    	var arrData = [[]];

    	// Create an array to hold our individual pattern
    	// matching groups.
    	var arrMatches = null;

    	// Keep looping over the regular expression matches
    	// until we can no longer find a match.
    	while (arrMatches = objPattern.exec( strData )){

    		// Get the delimiter that was found.
    		var strMatchedDelimiter = arrMatches[ 1 ];

    		// Check to see if the given delimiter has a length
    		// (is not the start of string) and if it matches
    		// field delimiter. If id does not, then we know
    		// that this delimiter is a row delimiter.
    		if (
    			strMatchedDelimiter.length &&
    			(strMatchedDelimiter != strDelimiter)
    			){

    			// Since we have reached a new row of data,
    			// add an empty row to our data array.
    			arrData.push( [] );
    		}

    		// Now that we have our delimiter out of the way,
    		// let's check to see which kind of value we
    		// captured (quoted or unquoted).
    		if (arrMatches[ 2 ]){

    			// We found a quoted value. When we capture
    			// this value, unescape any double quotes.
    			var strMatchedValue = arrMatches[ 2 ].replace(
    				new RegExp( "\"\"", "g" ),
    				"\""
    				);
    		} else {
    			// We found a non-quoted value.
    			var strMatchedValue = arrMatches[ 3 ];
    		}

    		// Now that we have our value string, let's add
    		// it to the data array.
    		arrData[ arrData.length - 1 ].push( strMatchedValue );
    	}

    	// Return the parsed data.
    	return( arrData );
    }
    ////////////////////////////////////////////////////////////////////////////  
	this.parseTrialstoSessions = function(trials) {

		//var trials = this.CSVToArray(csv);
		var sessions=[];
		var session={};
		var when,notes;
		var trial={};
		
		// Dump some of it
   // 	for(var i=0; i<20; i++)
   //		console.log(trials[i]);

    	// Check the header row values and make sure it matches what comes out of newmath5 (i.e. format hasn't changed)

    	// While grouping the trials under a session. 
    	for(var i=1; i<trials.length-1; i++) {
    		var trialArr = trials[i];
    		
    		// Are we starting a new session?
    		if (trialArr[2] != notes) {
    			notes = trialArr[2];

    			// Save the current session
    			sessions.push( session );

    			// Start a new Session
    			session={};
    			session.notes = notes;
    			session.starttime = this.parseDateFromR(trialArr[1]);
    			session.minlatency = 150;
    			session.maxlatency = 3000;
    			session.testtype = "SETH";
    			session.testversion = 1;
    			session.delay = trialArr[4];
    			session.trials = [];
    		} 
    		
    		// Additional session info based on last trial of a session processed 
    		session.endtime = this.parseDateFromR(trialArr[1]);
			session.duration = (session.endtime - session.starttime + trialArr[6])/1000;
			// Add this trial to the current session
			trial = {};
			trial.idx         = trialArr[3];
			trial.problem     = trialArr[5];
			trial.answer      = trialArr[8];
			trial.latencymsec = trialArr[6];
			trial.latencyptile= trialArr[7];
			trial.include     = (trialArr[10] == "TRUE");
			trial.correct     = (trialArr[9]  == "TRUE");  
			trial.warmup      = (trialArr[11] == "warmup");
			trial.correction  = (trialArr[11] == "correction trial")
			session.trials.push(trial);
			
    		// Make sure "when" column is in ascending order
    		if (when != null) {
    			if (when > trial[2]) {
    				console.log("Error: 'when' column is not in ascending order.");
    			}
    		}
    		when = trial[2];
  		}
  		// Save the last session
  		sessions.push(session);
  		
  		return sessions;
  	}
  	////////////////////////////////////////////////////////////////////////////  
  	this.parseDateFromR = function( datetime ) {
  		
  		var digitpattern = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(.*)/
  		var matches = datetime.match(digitpattern);

  		return new Date(Number(matches[1]),Number(matches[2]),Number(matches[3]),Number(matches[4]),Number(matches[5]),Number(matches[6]))
  	}

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

