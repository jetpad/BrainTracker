'use strict';

// .include     - To be POTENTIALLY used in calculating the statistics of a session
//              - NOT-warmup, NOT-correction (but not necessarily correct). Only counted toward the max trials if also correct. 
// .correction  - Trials after a incorrect answer are flagged with this until the next problem
// .warmup      - practice trials not included with statistic calculations (because not saved to the datastore)
// .correct     - user answered with the same number as the problem for the trial. 

myApp.service("dbService", function($location,$q,safeApply, $filter, $rootScope, $timeout) {

//myApp.service( 'dbService', ['$location','$q',safeApply, '$filter', '$rootScope', '$timeout',dbService]) {

	var client;
    var datastore = null;
    var datastoreManager = null;
    var sessionTable = null;
    var trialTable = null;
    var self = this;
    var sessionRecords = null;
    var Vector = gauss.Vector;        

	////////////////////////////////////////////////////////////////////////////
    this.initialize = function() {
		// Do this by itself so that we can do a isAuthenticated() check without actually authorizing
	    client = new Dropbox.Client({key: '46tjf8x15q98xic'});

        console.log("Initialize");
	    return self.authenticate({interactive: false});
    }  
    ////////////////////////////////////////////////////////////////////////////
    this.sessions = function() {
        return sessionRecords;
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

        var start = now(); //new Date().getTime();
       
        datastoreManager.openDefaultDatastore( function(error, _datastore) {
            safeApply($rootScope, function() {
                if (error) {
                    console.log('Error opening default datastore: ' + error); 
                    deferred.reject(error);
                }
                else {
                    console.log("successfully opened default datastore");
                    var end = now(); ///new Date().getTime();
                    console.log("Time to get datastore: ", Math.round(end-start), " (ms)");
                    
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

        var start = now();// new Date().getTime();
        var sessions = sessionTable.query();
        var end = now();// new Date().getTime();
        console.log("sessions query elapsed time: ", Math.round(end-start));
        
        sessionRecords = self.sessionToObjectArray(sessions) ;
        
        start = now();//new Date().getTime();
        this.sortArrayByStarttime( sessionRecords );
        end = now();//new Date().getTime();
        console.log("sessions sort elapsed time: ", Math.round(end-start));
        this.calculatePtiles();
	    $rootScope.$broadcast("sessionDataChanged");
        
		self.subscribeRecordsChanged( function(records) {
			console.log('a session record has changed: ', records.length );

            // Using the record id(s), remove any of the existing records from the sessionRecords array
            for (var s=0;s<records.length;s++) 
                for(var i=sessionRecords.length-1; i>=0; i--)
                    if (sessionRecords[i].id == records[s].getId())
                        sessionRecords.splice(i, 1);

            // insert the session into $scope.sessions 
            //sessionRecords = sessionRecords.concat( self.sessionToObjectArray(records) );
            sessionRecords = new Vector(sessionRecords.append( self.sessionToObjectArray(records) ));

            // re-sort the list of records
            var start = now();//new Date().getTime();
            self.sortArrayByStarttime( sessionRecords );
            var end = now();//new Date().getTime();
            console.log("sessions sort elapsed time: ", Math.round(end-start));
            self.calculatePtiles();
            // and signal to the report and chart that there are new records
            $rootScope.$broadcast("sessionDataChanged");
		}, 'session' );
	}
    /////////////////////////////////////////////////////////////////////
    this.ptileCalc = function( latencyArr, latency ) {
        for (var i = 0; i < latencyArr.length; i++) {
            if (latencyArr[i] > latency) {
                return Math.round(( i / latencyArr.length) * 100);
            }
        } 
        return 100
    }
    /////////////////////////////////////////////////////////////////////
    this.calculatePtiles = function() {
        // recalcuate the global ptiles for all the sessions
        var latencies =  sessionRecords.map(function(session) { return session.latency }).sort();
        for(var i=0; i<sessionRecords.length; i++) {
            sessionRecords[i].ptile = self.ptileCalc( latencies, sessionRecords[i].latency );
        }
    }
    /////////////////////////////////////////////////////////////////////
    this.sortArrayByStarttime = function( arr ) {
        arr.sort(function (a, b) {
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(a.starttime) - new Date(b.starttime);
                /*
                var c =  new Date(b.starttime) - new Date(a.starttime);
                console.log("c: ", c );
                return c;
                */
            }
        );
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
        if (sessionTable === null)
            return 0;
        else
            return sessionRecords.length;    
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
    this.updateSessionField = function( id, field, value ) {

        if (sessionTable) {
            if (Dropbox.Datastore.Record.isValidId(id)) {
                var sessionRecord = sessionTable.get(id)
                sessionRecord.set( field, value );
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////  
    // Converts the session table from an array of Dropbox datastore records (returned by a query) into
    // an array of objects containing the fields from the records. 
    this.sessionToObjectArray = function(sessions) {
        var oArray = new Vector(); //[];
        var start = now();
        for (var s=0;s<sessions.length;s++) {
            var session = sessions[s].getFields();
            var trials = Vector( session.trials
                .split(',')
                .map(function(item) { 
                    return parseInt(item, 10); 
                }) 
            );
            session.trials = trials;
            session.id = sessions[s].getId();
            session.index = s+1;  // DAS - Is this OK? ???
            oArray.push(session);
        }
        var end = now();
        console.log("convert to array elapsed time: ", Math.round(end-start));
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
              	self.addSession(sessions[index], index );
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
    /////////////////////////////////////////////////////////////////////
    this.errorPercent = function( session ) {
        // 1st time Chances increases by one every time the user fails a first chance
        var chances = session.trials.find({include: true}).length;
        var correct = session.trials.find({correct: true, include: true}).length;
        var errors = Math.round( chances - correct );
        var percent = Math.round( (errors / chances) * 100 );

console.log( "chances:", chances, " correct:", correct, " errors:", errors, " percent:", percent );

        return percent;
    }
    /////////////////////////////////////////////////////////////////////
    this.addSession = function( session, importIndex ) {

        // is there an importIndex parameter?
        var importSession = typeof importIndex !== 'undefined' ? true : false;

        // Calculate the mean latency
        session.latency = Math.round( session.trials
            .find( {include: true, correct: true} )
            .map(function(trial) { return trial.latency })
            .mean());

        // Calculate the error percent
        session.errorpercent = this.errorPercent( session );

        var trials = [];
        // Just save the latency for the "included" trials
        for(var i=0;i < session.trials.length; i++)
            if ((session.trials[i].include == true) && (session.trials[i].correct == true))
                trials.push(session.trials[i].latency);

      //  console.log("session:", session );

        if (!isNaN(session.latency)) { // Only add non-warmup trials

            var fields = {
                        starttime: 		session.starttime,
                        endtime: 		session.endtime,
                        latency:        session.latency,
                        errorpercent:   session.errorpercent,
                        testtype: 		session.testtype,
                        duration:       session.duration,
                        trials:         trials.join(",")
                    }

            // If the session notes are not null then save them.
            if (session.notes)
                fields.notes = session.notes;

            if (importSession == true) {
                // If user is re-importing records, it first deletes one that exists and then imports the new one. 
                var sessionRecord = sessionTable.getOrInsert( "csv_import_" + importIndex, fields );
                sessionRecord.deleteRecord();
                sessionRecord = sessionTable.getOrInsert( "csv_import_" + importIndex, fields );
            }
            else
                var sessionRecord = sessionTable.insert( fields );

         	return sessionRecord;
        }
        else
            return null;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Navigate to a route but check for authentication first and authenticate if not
    this.authenticatedNavigate = function( url ) {
        if (this.isAuthenticated() == true)
            $location.path(url);
        else
        {
            // Not authenticated
            client.reset();
            this.authenticate({interactive: true}).then(function() {
                console.log("authenticated successs");
            }, 
            function(error){
                console.log('error authenticating({interactive: true}): ' + error); 
               // client.reset();
                this.initialize();
            });
        }
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
                sessionTable = null;
                $location.path("/signout");
	    	    client.signOut({mustInvalidate: true}, basicDeferredCallback(deferred, 'signOut'));
	        	return deferred.promise;
	        }().then(function() {
	        	// Success
	        	console.log("signing out");
	        }, function() {
	        	// Failure - still redirect to signout page
	        	console.log("Error signing out");
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
    this.stringifyCell = function(data) {
        var txtDelim = '"';
        if (typeof data === 'string') {
            data = data.replace(/"/g, '""'); // Escape double qoutes
            data = txtDelim + data + txtDelim;
            return data;
        }
        if (typeof data === 'boolean') {
            return data ? 'TRUE' : 'FALSE';
        }
        return data;
    };

    /////////////////////////////////////////////////////////
    this.exportToCSV = function() {
        // Make sure the sessions are sorted by time in ascending order

        // CSV column headers
        var csvContent = 
        ['session', 'starttime','endtime','duration','meanlatency','errorpercent','testtype','notes'];

        for(var i=1; i <=32; i++)
            csvContent.push("t"+i);

        csvContent += '\r\n';
        // Loop through the sessions in time order
        var sessions = this.sessions();
        if (sessions) {
            for(var s=0; s < sessions.length; s++) {
                var session = sessions[s];
    
                var row = [];
                row.push(self.stringifyCell(s+1)); // Session #
                row.push(self.stringifyCell( $filter('date')( session.starttime, 'yyyy-MM-dd HH:mm:ss') ));  
                row.push(self.stringifyCell( $filter('date')( session.endtime,   'yyyy-MM-dd HH:mm:ss') ));
                row.push(self.stringifyCell(session.duration));
                row.push(self.stringifyCell(session.latency));
                row.push(self.stringifyCell(session.errorpercent));
                row.push(self.stringifyCell(session.testtype));
                row.push(self.stringifyCell(session.notes));
                row.push(session.trials);

                csvContent += row.join(',');
                csvContent += '\r\n';
           }
        }

        return csvContent;
    }
   
    ////////////////////////////////////////////////////////////////////////////  
	this.parseTrialstoSessions = function(rawTrials) {

		//var trials = this.CSVToArray(csv);
		var sessions=[];
		var session={};
		var when,notes;
		var trial={};
 /*
Removed this cause it probably needs to be sorted by the trial index next...
        // Make sure it is sorted in accending order by the [1] column
        rawTrials.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(this.parseDateFromR(a[1])) - new Date(this.parseDateFromR(b[1]));
        }
*/

		// Dump some of it
   // 	for(var i=0; i<20; i++)
   //		console.log(trials[i]);

    	// Check the header row values and make sure it matches what comes out of newmath5 (i.e. format hasn't changed)

    	// While grouping the trials under a session. 
    	// start at 1 to skip over the header
    	for(var i=1; i<rawTrials.length-1; i++) {
    		var trialArr = rawTrials[i];
    		
    		// Are we starting a new session?
    		if (trialArr[2] != notes) {
    			notes = trialArr[2];

    			// Save the current session (unless we are just starting)
    			if (i != 1)
    				sessions.push( session );

    			// Start a new Session
    			session={};
    			session.notes = notes.substr(17).trim(); // Remove the leading date from the string
                if (session.notes.length == 0)
                    session.notes = "-blank-";
    			session.starttime = this.parseDateFromR(trialArr[1]);
    			session.minlatency = 150;
    			session.maxlatency = 3000;
    			session.testtype = "S"; // For "Seth"
    			session.testversion = 1;
    			session.delay = Math.round(trialArr[4]);
    			session.trials = new Vector();
    		} 
    		
    		// Additional session info based on last trial of a session processed 
    		session.endtime = this.parseDateFromR(trialArr[1]);
            session.duration = Math.round(((session.endtime - session.starttime )/1000));
			// Add this trial to the current session
			trial = {};
			//trial.i     = trialArr[3];                   // index
            trial.problem     = trialArr[5];               // problem
            trial.answer      = trialArr[8];               // answer
            trial.latency     = Math.round(trialArr[6]);   // latency
            trial.include     = (trialArr[10] == "TRUE") ? true : false;    // include
            trial.correct     = (trialArr[9]  == "TRUE") ? true : false;    // correct
            trial.warmup      = (trialArr[11] == "warmup") ? true : false;  // warmup
            trial.correction  = (trialArr[11] == "correction trial")  ? true : false;  // correction
            session.trials.push(trial);
            
    		// Make sure "when" column is in ascending order
    		/*
            if (when != null) {
    			if (when > trialArr[1]) && (i > 0) {
    				console.log("Error: 'when' column is not in ascending order.");
    			}
    		}
    		when = trialArr[1];
  		    */
        }

      //  console.log("Latency: ", session.latency );
            
  		// Save the last session
  		sessions.push(session);
  		
  		return sessions;
  	}
  	////////////////////////////////////////////////////////////////////////////  
  	this.parseDateFromR = function( datetime ) {

  		var digitpattern = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(.*)/
  		var matches = datetime.match(digitpattern);

  		return new Date(Number(matches[1]),Number(matches[2]-1),Number(matches[3]),Number(matches[4]),Number(matches[5]),Number(matches[6]))
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

