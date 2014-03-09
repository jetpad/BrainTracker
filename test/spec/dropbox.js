'use strict';

describe('dropbox', function () {

	var client;
	var sessionTable;
	var datastoreIsOpen = false;
	var key = '{"key":"46tjf8x15q98xic","token":"srMz5w4ReBsAAAAAAAAAAWfQfibrbJfeI7LVKsbMvxRfX1pdpS6SOKqvN6DcgK1B","uid":"1407454"}';
	
	beforeEach(function() {

		console.log("About to set the localStorage");
		localStorage.setItem('dropbox-auth:default:cHKvNCKVzU7Jmnyaj1InU8TBCOc', key );
		
		client = new Dropbox.Client({key: '46tjf8x15q98xic'});
		console.log("About to authenticate");
		// Try to finish OAuth authorization.
		client.authenticate({interactive: false}, function (error) {
		    if (error) {
		        alert('Authentication error: ' + error);
		    }
		});

	    if (client.isAuthenticated()) {
		    console.log("about to get datastore manager");

			client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
	    		if (error) {
	       		 	alert('Error opening default datastore: ' + error);
	    		}
	    		datastoreIsOpen = true;

	    		console.log("Opened default datastore");

	    		sessionTable = datastore.getTable('session');

	    		var sessionAdded = sessionTable.insert({
                        description: "Description",
                        starttime: new Date,
                        endtime: new Date,
                        minlatency: 100,
                        maxlatency: 200,
                        durationmsec: 4
                    });
	    		console.log("After added sessions");

	    	});
	    waitsFor(function() { return datastoreIsOpen }, 5000); 
	    }		
	});

	it('client is not null', function() {
		expect( client ).not.toBeNull();
	});

	it('authenticated is true', function() {
		expect( client.isAuthenticated() ).toEqual( true );
	});

	it('sessionTable is not null', function() {
		expect( sessionTable ).not.toBeNull();
	});

});
