'use strict';

var key = 'dropbox-auth:default:cHKvNCKVzU7Jmnyaj1InU8TBCOc';
var value = '{"key":"46tjf8x15q98xic","token":"S7px_3au_vkAAAAAAAAAAWtz8ZbnJocACTAZD1UvoDwkrPbJCyK-EGkifs3OhDXk","uid":"1407454"}';

var db = null;

describe('Services: ', function () {

	describe('dbService: ', function () {
		beforeEach(module('myApp'));

		beforeEach(inject(function (dbService) {
			localStorage.setItem( key, value );
			dbService.initialize();
    		dbService.authenticate(false);	
    		waitsFor(function() { return db.isDatastoreOpen() }, 5000); 	
    		db = dbService;
    	}));

		it('authenticated is true', function() {
			expect( db.isAuthenticated() ).toEqual( true );
		});

		it('datastore is open', function() {	    
			expect( db.isDatastoreOpen() ).toEqual( true );
		});

	})

});
