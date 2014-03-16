'use strict';

var key = 'dropbox-auth:default:cHKvNCKVzU7Jmnyaj1InU8TBCOc';
var value = '{"key":"46tjf8x15q98xic","token":"m1RVM7yAO28AAAAAAAAAAZxH1z9cXzgHfu64dmbLHxGQLd2kgKb9FajJ6xNii55Y","uid":"1407454"}';

var db = null;
var dsid = null;
var ds = null;
var csvText = "";
var csvArr = null;
var sessions = null;
var trialRecord = null;
var sessionRecord = null;

describe('Services: ', function () {

	describe('dbService: ', function() {
		beforeEach(module('myApp'));

		beforeEach(inject(function (dbService) {
			localStorage.setItem( key, value );
    		db = dbService;
    		this.csvImport = "";
    	}));

    	afterEach(function() {
    		db.close();
    	});
    	
		it("get datastore id (async)", function(done12){	
			var promise = db.initialize();
    		//var promise = db.openDefaultDatastore();
		    promise.then(function(){
		    	var ds = db.getDatastore();
		        expect(ds).toBeDefined();
		        expect( ds.getId() ).toEqual( "default" );
		        done12();
		    }, function(error){
		    })
		});
		
		it("async list datastores", function(done6){   
			var promise = db.initialize(); 		
    	    promise.then(function(){
				db.listDatastores()
			    .then(function(datastorelist){
			        expect(datastorelist).toBeDefined();
			        console.log("datastorelist: ", datastorelist);
			        done6();
			    })
		    })
		});		

		it("async delete all non-default datastores", function(done7){    
			var promise = db.initialize(); 		
    	    promise.then(function(){
    			db.listDatastores()
			    	.then(function(datastorelist){
			        expect(datastorelist).toBeDefined();
			        expect(datastorelist.length).toBeGreaterThan(0);
			        console.log("datastore count: ", datastorelist.length );

			        for(var i=0; i < datastorelist.length; i++) {
			        	var dsitem = datastorelist[i];
			        	var id = dsitem.getId();
			        	
			        	if (id != "defaultXXXX") {
			        		var promise= [];
			        		promise[i] = db.deleteDatastore(id);
			        		promise[i].then(function() {
			        			console.log("Deleted datastore: ");
			        		})
			        	}	        	
			        }
			        done7();
			    })
			})
		});	

		it("async test of createDatastore", function(done9){    		
			var promise = db.initialize(); 		
    	    promise.then(function(){
	    		db.createDatastore()
			    .then(function(_ds){
			        expect(_ds).toBeDefined();
			        dsid = _ds.getId();
			        ds = _ds;
			        done9();
			    })
			})
		});

		it("async test of openDatastore", function(done8){    		
			var promise = db.initialize(); 		
    	    promise.then(function(){
	    		db.openDatastore(dsid)
			   	.then(function(_ds){
			        expect(_ds).toBeDefined();
			        dsid = _ds.getId();
			        ds = _ds;
			        done8();
			    })
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
			expect( sessions.length ).toEqual( 158 );
		});	

		it('get datastore table and check the id', function(done10) {	
			var promise = db.initialize(); 		
    	    promise.then(function(){
    	    	db.openDatastore(dsid)
    	    	.then(function(ds) {
					var sessionTable = ds.getTable('session');
					expect( Dropbox.Datastore.Table.isValidId( sessionTable.getId() ) ).toEqual( true );
					done10();
				})
			})
		});	

		xit('insert a session into the datastore', function(done5) {	
			var promise = db.initialize(); 		
    	    promise.then(function(){
    	    	db.openDatastore(dsid)
    	    	.then(function(ds){
	
			        expect(ds).toBeDefined();
			   
					var trial = JSON.stringify({ 
						problem: "2",
					  	answer:  "3",
						latency: 350,
						include: false,
						correct: false,
						warmup:  true,
						correction: false
					});

		    		var session = {};
		    		session = {
		                    notes: 			"Good sleep, well rested",
	                        starttime: 		new Date(),
	                        endtime: 		new Date(),
	                        minlatency: 	150,
	                        maxlatency: 	3000,
	                        testtype: 		"SETH",
	                        testversion: 	1,
	                        delay: 		    1500,
	                        duration:       60,
	     					trials: 		[ trial, trial, trial, trial ]
		    		};

					sessionRecord = db.addSession( session );
					
					expect( Dropbox.Datastore.Record.isValidId(sessionRecord.getId()) ).toEqual( true );

			        done5();
			    })
			})
		});	

		xit("async test of deleteDatastore", function(done3){    		
			var promise = db.initialize(); 		
    	    promise.then(function(){
	    		db.deleteDatastore(dsid)
		    	.then(function(){
		        	expect(true).toBe(true);
		        	done3();
		    	})
		    })
		});
	})
});
