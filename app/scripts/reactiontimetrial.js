'use strict';

myApp.factory("ReactionTimeTrial", function($timeout) {
    var ReactionTimeTrial;
    return ReactionTimeTrial = function() {
        function ReactionTimeTrial(test) {
            var _this = this;
            this.starttime = now(); //new Date; // will get replaced later if trial enters the "Go" phase ('too-fast/wrong-number' trials don't enter go phase)
            this.minimumtime = 100;
            this.maximumtime = 2000;
            this.phase = "waiting";
            this.correction = false; 
            this.delay=1500;
            this.warmup= false;
         
            $timeout.cancel(this.delayPromise);
            this.delayPromise = $timeout(function() {
                return _this.enterGoPhase()
            }, this.delay)

        }
        ReactionTimeTrial.prototype.validTrial = function() {
            if ((this.warmup == false) && (this.correction == false) && (this.correct == true))
                return true
            else
                return false;
        }
        ReactionTimeTrial.prototype.enterGoPhase = function() {

            // If this isn't a correction trial and so the problem has already been selected
            if (!this.problem) {
                // Pick a random number 2-4,6-8 for the trial
                var myArray=['2','3','4','5','6','7','8'];
                this.problem = myArray[Math.floor(Math.random() * myArray.length)];
            }
   
            this.phase = "go";
            this.starttime = now(); //new Date
            this.timestamp = new Date;
            return this.starttime;
        };  
        ReactionTimeTrial.prototype.reactionClick = function() {
            $timeout.cancel(this.delayPromise);
            this.endtime = now(); //new Date;

            // Time of the result
            this.latency = Math.round(this.endtime - this.starttime);
            // It was a success and show the "result" (unless found otherwise)
            this.phase = "result";
       
            if (!this.starttime) 
                this.phase = "too-fast";
            
            if ((this.endtime - this.starttime) < this.minimumtime) 
                this.phase = "too-fast";

            if ((this.endtime - this.starttime) > this.maximumtime)
                this.phase = "too-slow";

            // Validate number seleted 
            if (this.answer != this.problem)
            {
                console.log("wrong-number!!!");
                this.phase = "wrong-number";
            }
            // Save the data about the trial
            switch (this.phase) {
                case "too-fast":
                    this.correct = false;
                    break;
                case "too-slow":
                    this.correct = false;
                    break;
                case "wrong-number":
                    this.correct = false;
                    break;
                default:
                    // Success!
                    console.log("Correct!");
                    this.correct = true;
                    break;
            }
            return this.latency;        
        };
       
        return ReactionTimeTrial
    }()
}).factory("ReactionTimeSession", function(ReactionTimeTrial, $http, $rootScope, $location,dbService) {
    var ReactionTimeSession;
    return ReactionTimeSession = function() {
        function ReactionTimeSession() {
            this.initialize();
        }
        ReactionTimeSession.prototype.initialize = function () {
            this.trials = [];
            this.currentTrial = null
            this.correctionTrial = false;
            this.warmup = false;
            this.maxTrials = 32;
            this.notes = null;
        }
        ReactionTimeSession.prototype.start = function() {
            return this.nextTrial()
        };
        // Initialized the flags for the next trial to run
        ReactionTimeSession.prototype.nextTrial = function() {

            var _nextTrial = new ReactionTimeTrial(this);

            if (this.correctionTrial == true) {
                // copy information from last failed trial
                _nextTrial.problem = this.currentTrial.problem;
                _nextTrial.correction = true;
            }

            return this.currentTrial = _nextTrial;
        };

        // Called when the user clicks on a number
        ReactionTimeSession.prototype.clickedNumber = function(numberKey) {
          
               // Check if we've completed enough trials
            if (this.getValidTrials() >= this.getMaxTrials()) {
                // This calls a function that was defined in ReactionTimeCtrl to get the notes out of the scope.
                this.saveNotes();
                this.saveSession();
                console.log("test complete");
                $location.path("/testcomplete");
            }

            switch (this.getView()) {
                case"splash":
                    this.start();
                    break;
                case"waiting":
                    this.reactionClick();
                    break;
                case"go":
                    if (this.currentTrial)      
                        if (numberKey) // If numberKey is valid then user touched or clicked the number
                            this.currentTrial.answer = numberKey;
                   this.reactionClick();
                   break;
                default:
                    this.nextTrial();
                    break;
            }
        };
        ReactionTimeSession.prototype.reactionClick = function() {
            // For click debouncing
            this.currentClickTime = new Date;
            if (Math.abs(this.currentClickTime - this.lastClickTime ) < 300) 
                return this.getView()
            this.lastClickTime = this.currentClickTime;

            this.currentTrial.reactionClick(); // changes to result from "go"
     
            switch (this.currentTrial.phase) {
                case "too-fast":
                case "too-slow":
                case "wrong-number":
                    this.correctionTrial = true;
                    break;

                case "result":
                default:
                    // Did we get it correct?
                    if (this.currentTrial.correct == true) {

                      // console.log(" Including:true  correction:", this.correctionTrial );

                        // This was correct so turn off trial correction
                        this.correctionTrial = false;

                        // Remove the promise
                        this.currentTrial.delayPromise = null;  
                    
                     //   console.log("Trials(",this.trials.length,") : ", JSON.stringify(this.trials));
                    }
                    else     
                    {
                      //  console.log(" Excluding the trial");
                        // We need to correct it
                        this.correctionTrial = true;
                    }   
            }
            
            this.trials.push(this.currentTrial);
        };

        ReactionTimeSession.prototype.getView = function() {
            if (this.currentTrial == null)
                return "splash";

            // Is the session complete?
           if (this.getValidTrials() >= this.getMaxTrials()) 
                return "session-complete";

            return this.currentTrial.phase;
        };

        ReactionTimeSession.prototype.getAverage = function() {
            var trialCount = 0;
            var total = 0;

            for(var i = 0; i < this.trials.length; i++)
                if (this.trials[i].validTrial()) {
                    total += this.trials[i].latency;
                    trialCount = trialCount + 1;
                }

            return total / trialCount || 0;
        };
        // Loop through the list and only addup the valid trials
        ReactionTimeSession.prototype.getValidTrials = function() {            
            var trialCount = 0;

            for(var i = 0; i < this.trials.length; i++)
                if (this.trials[i].validTrial())
                    trialCount = trialCount + 1;
            return trialCount;
        };
        ReactionTimeSession.prototype.getMaxTrials = function() {
            var max = this.maxTrials;
            return max;
        };
        ReactionTimeSession.prototype.getProblem = function() {
            var _ref=0;

            if (this.currentTrial)
                if (this.currentTrial.problem)
                 _ref = this.currentTrial.problem;
            return _ref;
        };
        ReactionTimeSession.prototype.getNumberClass = function(num) {   
            if (this.currentTrial)
                if (this.currentTrial.answer)
                   if ((this.currentTrial.answer != this.getProblem()) && (num == this.currentTrial.answer))
                        return "number-wrong";
          
            if (num != this.getProblem()) 
                return "number-disabled"
            else
            {
                if (this.getView() == "waiting")
                    return "number-disabled";
                else
                    return "number-selected"
            }
        };      
        ReactionTimeSession.prototype.cancelLastTrial = function() {
            console.log('Cancel Last Trial');

            // Cancels the last *valid* trial
            // Start at end and pop until you reach beginning or a valid trial
            for(var i = this.trials.length-1; i >= 0; i--) {
                if (this.trials[i].validTrial()) {
                    // Found a valid one so pop it off and stop
                    this.trials.pop();
                    break;
                }
                else {
                    // Remove this one and check the next one
                    this.trials.pop();
                }
            }
        };
        ReactionTimeSession.prototype.endSession = function() {
            console.log('End Session');
            this.initialize();
        };
        ReactionTimeSession.prototype.setMessage = function(msg) {
            this.message = msg;
        };
        ReactionTimeSession.prototype.getMessage = function() {
            return this.message;
        };

        ReactionTimeSession.prototype.getNotes = function() {
            return this.notes;
        };
        ReactionTimeSession.prototype.setNotes = function(notes) {
            console.log("setNotes: ", notes );
            this.notes = notes;
        };

        ReactionTimeSession.prototype.saveSession = function() { 
            var Vector = gauss.Vector;
            var session = {};
            session.trials = new Vector();
            var trials = this.trials;
            // Is there anything to save? 
            if (trials.length == 0)
                return null;
            for(var i=0; i < trials.length; i++)
            {
                // Add this trial to the current session
                var trialObject = {};
                var trial = trials[i];
                trialObject.problem = trial.problem;    // problem
                trialObject.answer = trial.answer;     // answer
                trialObject.latency    = Math.round(trial.latency); // latency
                trialObject.include    = ((trial.correction == false) && (trial.warmup == false));      // was this trial potentially include(able) in the group of correct 32 trials?
                trialObject.correct    = trial.correct;      // correct
                trialObject.warmup     = trial.warmup; 
                trialObject.correction = trial.correction;
                session.trials.push(trialObject);
            }
            
            session.notes = this.notes;
            session.starttime = new Date(trials[0].timestamp); //starttime);
            session.endtime  = new Date(trials[trials.length-1].timestamp); //endtime);
            session.duration = Math.round((session.endtime - session.starttime)/1000);
            session.testtype = "A"; 
         
            console.log("saveSession: ", session );
            this.initialize();
            
            return dbService.addSession( session );
        };

        return ReactionTimeSession
    }()
})
