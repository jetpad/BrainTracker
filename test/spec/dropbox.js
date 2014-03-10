'use strict';

describe('dropbox', function () {

	var client;
	var sessionTable;
	var datastoreIsOpen = false;
	var isSignedOut = false;
	var _datastore;
	var key = '{"key":"46tjf8x15q98xic","token":"S7px_3au_vkAAAAAAAAAAWtz8ZbnJocACTAZD1UvoDwkrPbJCyK-EGkifs3OhDXk","uid":"1407454"}';
	
	beforeEach(function() {

		localStorage.setItem('dropbox-auth:default:cHKvNCKVzU7Jmnyaj1InU8TBCOc', key );

		client = new Dropbox.Client({key: '46tjf8x15q98xic'});
		// Try to finish OAuth authorization.
		client.authenticate({interactive: false}, function (error) {
		    if (error) {
		        alert('Authentication error: ' + error);
		    }
		});

	    if (client.isAuthenticated()) {

			client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
	    		if (error) {
	       		 	alert('Error opening default datastore: ' + error);
	    		}
	    		datastoreIsOpen = true;

	    		sessionTable = datastore.getTable('session');

	    		_datastore = datastore;

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
	    }		
	    waitsFor(function() { return datastoreIsOpen }, 5000); 
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

	it('datastore is not null', function() {
		expect( _datastore ).not.toBeNull();
	});
/*
	it('signout successful', function() {
		client.signOut( function(error, datastore) {
			if (error) {
				alert('Error signing out: ' + error );
			}
			isSignedOut = true;
		})
		waitsFor(function() { return (isSignedOut) }, 5000);

		expect( client.isAuthenticated() ).toEqual( false );
	});
*/
});
