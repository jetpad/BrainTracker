'use strict';

myApp.service("dbService", function($location,$q,safeApply,$rootScope,$timeout) {

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

        console.log("Initialize");
	    return self.authenticate({interactive: false});
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
	        		self.openTables();
	        		deferred.resolve(_datastore); 
	        	}
	    	})
	    } );
        return deferred.promise;    
	}
	////////////////////////////////////////////////////////////////////////////
	this.listDatastores = function() {
		var deferred = $q.defer();
        datastoreManager.listDatastores( function(error, datastorelist) {
        	safeApply($rootScope, function() {
	        	if (error) {
	        		console.log('Error opening default datastore: ' + error); 
	        		deferred.reject(error);
	        	}
	        	else {
	        		deferred.resolve(datastorelist); 
	        	}
	    	})
	    } );
        return deferred.promise;    
	}
	////////////////////////////////////////////////////////////////////////////
	this.openDatastore = function(datastoreId) {
		var deferred = $q.defer();

		// If it is already open then return
		if (self.isDatastoreOpen()) {
			if (datastore.getId() == datastoreId) {
				deferred.resolve(datastore);
				return deferred.promise;
			}
		}

        datastoreManager.openDatastore( datastoreId, function(error, _datastore) {
        	safeApply($rootScope, function() {
	        	if (error) {
	        		console.log('Error opening default datastore: ' + error); 
	        		deferred.reject(error);
	        	}
	        	else {
	        		//console.log("successfully opened default datastore");
	        		datastore = _datastore;
	        		self.openTables();
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
                    console.log("successfully opened default datastore");
                    datastore = _datastore;
                    self.openTables();
                    deferred.resolve(_datastore); 
                }
            })
        } );
        return deferred.promise;      
	}
	////////////////////////////////////////////////////////////////////////////
	this.authenticate = function(options) {

        var deferred = $q.defer();

        if (self.ready()) {
            deferred.resolve(datastore);
            return deferred.promise;
        }

		// Try to finish OAuth authorization.
		client.authenticate(options, function (error) {
            safeApply($rootScope, function() {
    		    if (error) {
    		        console.log('Authentication error: ' + error);
                    deferred.reject(error);
    		    }
                else {
                    if (client.isAuthenticated()) {

                        datastoreManager = client.getDatastoreManager();

                        self.openDefaultDatastore(datastore).then( 
                            function(datastore) {
                                console.log("authenticate success");
                                deferred.resolve(datastore); 
                            }, 
                            function(error){
                                console.log('Error opening default datastore: ' + error);
                                deferred.reject(error);
                            }
                        );
                    }   
                    else {
                        // Client wasn't authenticated but we successfully found that out
                        deferred.reject();
                    }                    
                }
            })
		});

        return deferred.promise;			
  	}
  	/////////////////////////////////////////////////////////////////////
  	this.openTables = function() {
		sessionTable = datastore.getTable('session');
	  
	   // console.log("sessionTable: ", sessionTable );
	   // console.log("trialTable: ", trialTable );

		self.subscribeRecordsChanged( function(records) {
			console.log('a session record has changed: ', records.length );
		}, 'session' );

        self.subscribeRecordsChanged( function(records) {
	//		console.log('a trial record has changed: ', records );
		}, 'trial' );
	}
    /////////////////////////////////////////////////////////////////////
    // True when the database objects are fully initialized
    this.ready = function() {
        if (sessionTable) {
            if (Dropbox.Datastore.Table.isValidId(sessionTable.getId())) {
                return true;
            }
        }

        return false;
    }
    /////////////////////////////////////////////////////////////////////
    this.sessionRecordCount = function() {
        return sessionTable.query().length;    
    }

    /////////////////////////////////////////////////////////////////////
  	this.close = function() {
        if (datastoreManager)
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
    // Converts the session table from an array of Dropbox datastore records (returned by a query) into
    // an array of objects containing the fields from the records. 
    this.sessionToObjectArray = function() {
        var start = new Date().getTime();
        var sessions = sessionTable.query();
        var end = new Date().getTime();
        console.log("sessions elapsed time: ", end-start);
        var oArray = [];
        start = new Date().getTime();
        sessions.forEach(function(session) {
            var sessionFields = session.getFields();
            var trials = sessionFields.trials.toArray();
            sessionFields.trials = gauss.Vector();
            trials.forEach(function(trial) {
                sessionFields.trials.push(JSON.parse(trial));

            // Calculate fields on the session from the trial data. 
            })
            sessionFields.trials = trials;
            oArray.push(sessionFields);
        })
        end = new Date().getTime();
        console.log("convert to array elapsed time: ", end-start);
       
        return oArray;
    }
    ////////////////////////////////////////////////////////////////////////////  
	this.addSessions = function(sessions) {

		console.log("Adding sessions");
		for(var i=0; i < sessions.length; i++){
			self.addSession(sessions[i]);
		}
		console.log("Finished adding sessions");
	}
	////////////////////////////////////////////////////////////////////////////  
	this.backgroundAddSessions = function(sessions) {
		console.log("Started background adding of sessions");
		var deferred = $q.defer();
		var index = 0;
		function enQueueNext() {
			$timeout(function() {
            	// Process the element at "index"
				console.log("Processing a session:", index );
				self.addSession(sessions[index]);
                deferred.notify({ idx: index, max: sessions.length})

				index++;
				if (index < sessions.length)
					enQueueNext();
				else
				{
					// We're done; resolve the promiss
					console.log("Finished background adding of sessions");
					deferred.resolve({ idx: index, max: sessions.length});
				}
			},0);
		}
		// Start off the process
		enQueueNext();
		return deferred.promise;
	}
	//////////////////////////////////////////////////////////////////////////////
	this.addTrials = function(sessionId, trials) {

		for(var i=0; i < trials.length; i++){
			self.addTrial(sessionId, trials[i]);
		}

	}
	/////////////////////////////////////////////////////////////////////
    this.addTrial = function( sessionId, trial ) {
  
    	var trialRecord = trialTable.insert({
    			sessionid: 		sessionId,
    			problem: 		trial.problem,
    			answer: 		trial.answer,
    			latency: 		trial.latency,
    			latencyptile: 	trial.latencyptile,
    			include: 		trial.include,
    			correct: 		trial.correct,
    			warmup: 		trial.warmup,
    			correction: 	trial.correction
    		}); 

    	return trialRecord;
  }
    /////////////////////////////////////////////////////////////////////
    this.addSession = function( session ) {

    	console.log("session:", session );
    
    //	console.log("notes:" session.notes );

    	var sessionRecord = sessionTable.insert({
                        notes: 			session.notes,
                        starttime: 		session.starttime,
                        endtime: 		session.endtime,
                        minlatency: 	session.minlatency,
                        maxlatency: 	session.maxlatency,
                        testtype: 		session.testtype,
                        testversion: 	session.testversion,
                        delay: 		    session.delay,
                        duration:       session.duration,
                        trials:         session.trials
                    });

    	// Insert the trial records along with a sessionRecord id
 //   	this.addTrials( sessionRecord.getId(), session.trials );
//console.log("added Session record: ", sessionRecord.getId() );
    	return sessionRecord;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Navigate to a route but check for authentication first and authenticate if not
    this.authenticatedNavigate = function( url ) {
        if (this.isAuthenticated() == true)
            $location.path(url);
        else
            this.authenticate().then(function() {
                // Success
            });
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
    	// start at 1 to skip over the header
    	for(var i=1; i<trials.length-1; i++) {
    		var trialArr = trials[i];
    		
    		// Are we starting a new session?
    		if (trialArr[2] != notes) {
    			notes = trialArr[2];

    			// Save the current session (unless we are just starting)
    			if (i != 1)
    				sessions.push( session );

    			// Start a new Session
    			session={};
    			session.notes = notes.substr(17); // Remove the leading date from the string
    			session.starttime = this.parseDateFromR(trialArr[1]);
    			session.minlatency = 150;
    			session.maxlatency = 3000;
    			session.testtype = "SETH";
    			session.testversion = 1;
    			session.delay = Math.round(trialArr[4]);
    			session.trials = [];
    		} 
    		
    		// Additional session info based on last trial of a session processed 
    		session.endtime = this.parseDateFromR(trialArr[1]);
            session.duration = Math.round(((session.endtime - session.starttime )/1000));
			// Add this trial to the current session
			trial = {};
			trial.i         = trialArr[3];           // index
            trial.p     = trialArr[5];               // problem
            trial.a      = trialArr[8];              // answer
            trial.l     = Math.round(trialArr[6]);   // latency
            if (trialArr[10] == "TRUE")              // include
                trial.n     = true;           
            if (trialArr[9]  == "TRUE")              // correct
                trial.c     = true; 
            if (trialArr[11] == "warmup")            // warmup
                trial.w      = true;
            if (trialArr[11] == "correction trial")  // correction
                trial.x  = true;
            /*trial.idx         = trialArr[3];
            trial.problem     = trialArr[5];
            trial.answer      = trialArr[8];
            trial.latency     = Math.round(trialArr[6]);
            trial.include     = (trialArr[10] == "TRUE");
            trial.correct     = (trialArr[9]  == "TRUE");  
            trial.warmup      = (trialArr[11] == "warmup");
            trial.correction  = (trialArr[11] == "correction trial")
            */session.trials.push(JSON.stringify(trial));
            //session.trials.push(trial);
            
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

