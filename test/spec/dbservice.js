'use strict';

var key = 'dropbox-auth:default:cHKvNCKVzU7Jmnyaj1InU8TBCOc';
var value = '{"key":"46tjf8x15q98xic","token":"S7px_3au_vkAAAAAAAAAAWtz8ZbnJocACTAZD1UvoDwkrPbJCyK-EGkifs3OhDXk","uid":"1407454"}';

var db = null;
var dsid = null;
var csvText = "";
var csvArr = null;
var sessions = null;

describe('Services: ', function () {

	describe('dbService: ', function () {
		beforeEach(module('myApp'));

		beforeEach(inject(function (dbService) {
			localStorage.setItem( key, value );
			dbService.initialize();
    		dbService.authenticate(false);	
    		db = dbService;
    		this.csvImport = "";
    	}));

    	afterEach(function() {
    		//db.close();
    	});

		it('authenticated is true', function() {
			expect( db.isAuthenticated() ).toEqual( true );
		});

		it("get datastore id (async)", function(done){	
    		var promise = db.openDefaultDatastore();
		    promise.then(function(ds){
		        expect(ds).toBeDefined();
		        expect( ds.getId() ).toEqual( "default" );
		        done();
		    }, function(error){
		    })
		});
		
		it("async test of createDatastore", function(done2){    		
    		var promise = db.createDatastore();
		    promise.then(function(ds){
		        expect(ds).toBeDefined();
		        dsid = ds.getId();
		        done2();
		    }, function(error){
		    })
		});

		it('import from CSV', function() {	  
			var xhr = new XMLHttpRequest();
			xhr.open('get', 'base/test/data/reactiontime.csv', false);
			xhr.send();
			//console.log(xhr.status, xhr.responseText); //200, {...}
			csvText = xhr.responseText;
			expect( csvText.length ).toEqual( 489762 );
		});

		it('convert CSV into array', function() {	
			csvArr = db.CSVToArray( csvText );  
			expect( csvArr.length ).toEqual( 4011 );
		});	

		it('parse trials array into sessions', function() {	
			sessions = db.parseTrialstoSessions( csvArr );
			expect( sessions.length ).toEqual( 159 );
		});	

		xit('open session and trial tables in datastore', function() {	
			db.openTables();
			expect( sessions.length ).toEqual( 159 );
		});	

		xit('insert sessions into datastore', function() {	
			db.addSessions( sessions );
			expect( sessions.length ).toEqual( 159 );
		});	


		it("async test of deleteDatastore", function(done3){    		
    		var promise = db.deleteDatastore(dsid);
		    promise.then(function(){
		        expect(true).toBe(true);
		        done3();
		    }, function(error){
		    })
		});



	})

});
