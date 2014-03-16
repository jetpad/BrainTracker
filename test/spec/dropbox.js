'use strict';

describe('dropbox', function () {

	var client;
	var sessionTable;
	var datastoreIsOpen = false;
	var isSignedOut = false;
	var _datastore;
	var dbRecord = null;
	var key = 'dropbox-auth:default:cHKvNCKVzU7Jmnyaj1InU8TBCOc';
	var value = '{"key":"46tjf8x15q98xic","token":"m1RVM7yAO28AAAAAAAAAAZxH1z9cXzgHfu64dmbLHxGQLd2kgKb9FajJ6xNii55Y","uid":"1407454"}';

	beforeEach(inject(function (dbService) {
		localStorage.setItem( key, value );
		db = dbService;
		this.csvImport = "";
	}));

	afterEach(function() {
		db.close();
	});

	xit('insert session', function() {
		sessionTable = datastore.getTable('session');

		dbRecord = sessionTable.insert({
                description: "Description",
                starttime: new Date,
                endtime: new Date,
                minlatency: 100,
                maxlatency: 200,
                durationmsec: 4
            });
		//console.log("After added sessions");
	});

	xit('client is not null', function() {
		expect( client ).not.toBeNull();
	});

	xit('authenticated is true', function() {
		expect( client.isAuthenticated() ).toEqual( true );
	});

	xit('sessionTable is not null', function() {
		expect( sessionTable ).not.toBeNull();
	});

	xit('datastore is not null', function() {
		expect( _datastore ).not.toBeNull();
	});

	xit('record has field', function() {
		//var dbRecord = new Dropbox.Datastore.Record();
		expect( dbRecord.has('starttime') ).toEqual( true );
	});
});
