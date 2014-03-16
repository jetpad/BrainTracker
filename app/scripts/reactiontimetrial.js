myApp.factory("ReactionTimeTrial", function($timeout) {
    var ReactionTimeTrial;
    return ReactionTimeTrial = function() {
        function ReactionTimeTrial(test) {
            var _this = this;
            this.minimumtime = 100;
            this.maximumtime = 2000;
            this.phase = "waiting";
            this.correction = false; 
            this.delay=1500;
         
            $timeout.cancel(this.delayPromise);
            this.delayPromise = $timeout(function() {
                return _this.enterGoPhase()
            }, this.delay)

        }
        ReactionTimeTrial.prototype.enterGoPhase = function() {

            // If this isn't a correction trial and so the problem has already been selected
            if (!this.problem) {
                // Pick a random number 2-4,6-8 for the trial
                var myArray=['2','3','4','5','6','7','8'];
                this.problem = myArray[Math.floor(Math.random() * myArray.length)];
            }
   
            this.phase = "go";
            this.starttime = new Date
            return this.starttime;
        };
   
        ReactionTimeTrial.prototype.reactionClick = function() {
            $timeout.cancel(this.delayPromise);
            this.endtime = new Date;

            // Time of the result
            this.latency = this.endtime - this.starttime;
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
                    console.log( "TRIAL: ", angular.toJson(this) );
                    this.correct = true;
                    this.include = true;
                    break;
            }

            return this.latency;
            
        };
       
        return ReactionTimeTrial
    }()
}).factory("ReactionTimeSession", function(ReactionTimeTrial, $http, dbService) {
    var ReactionTimeSession;
    return ReactionTimeSession = function() {
        function ReactionTimeSession() {
            this.initialize();
        }
        ReactionTimeSession.prototype.initialize = function () {
            this.trials = [];
            this.currentTrial = null
            this.trialCount= 0;
            this.correctionTrial = false;
            this.warmup = false;
            this.maxTrials = 4;
        }
        ReactionTimeSession.prototype.start = function() {
            return this.nextTrial()
        };
        ReactionTimeSession.prototype.nextTrial = function() {

            var _nextTrial = new ReactionTimeTrial(this);

            if (this.correctionTrial == true) {
                // copy information from last failed trial
                _nextTrial.problem = this.currentTrial.problem;
                _nextTrial.correction = true;
            }

            // Set warmup or correction trials to not be included 
            if ((this.warmup == true) || (this.correctionTrial == true)) 
                _nextTrial.include = false;
            else
                _nextTrial.include = true;

            if (_nextTrial.include == false)
                console.log("NOT INCLUDING the _nextTrial");
            
            return this.currentTrial = _nextTrial;
        };
        ReactionTimeSession.prototype.clickedBg = function() {
            return this.getView();
        };       
        ReactionTimeSession.prototype.clickedNumber = function(numberKey) {

            if (this.currentTrial) 
            {
                // If numberKey is valid then user touched or clicked the number
                if (numberKey)
                {
                    this.currentTrial.answer = numberKey;
                }
                else
                    // Save the number pressed
                    this.currentTrial.answer = String.fromCharCode(event.keyCode);
           }

           switch (this.getView()) {
            case"splash":
                return this.start();
            case"waiting":
                return this.reactionClick();
            case"go":
               return this.reactionClick();
            default:
                return this.nextTrial()
            }
        };
        ReactionTimeSession.prototype.reactionClick = function() {
            // For click debouncing
            this.currentClickTime = new Date;
            if (Math.abs(this.currentClickTime - this.lastClickTime ) < 300) 
                return this.getView()
            this.lastClickTime = this.currentClickTime;

            console.log("session.reactionClick: ", this.currentTrial.phase );
            this.currentTrial.reactionClick(); // changes to result from "go"
            console.log("trial.reactionClick: ", this.currentTrial.phase );

            switch (this.currentTrial.phase) {
                case "too-fast":
                case "too-slow":
                case "wrong-number":
                    this.correctionTrial = true;
                    break;

                case "result":
                default:
                    // No problems but ...
                    // Should the trial be counted?
                    if (this.currentTrial.include == true) {

                       console.log(" Including the trial" );

                        // If this wasn't a correction trial then count it
                        if (this.correctionTrial == false)
                            this.trialCount = this.trialCount + 1;
            
                        // This was correct so turn off trial correction
                        this.correctionTrial = false;

                        // Remove the promise
                        this.currentTrial.delayPromise = null;  
                    
                        console.log( "TRIALS: ", angular.toJson(this.trials,true), "," );   
                    }
                    else     
                    {
                        console.log(" Excluding the trial");
                        // We need to correct it
                        this.correctionTrial = true;
                    }   
            }
            
            return this.trials.push(this.currentTrial)
        };
        ReactionTimeSession.prototype.showSaveButton = function() {
            return this.trials.length >= 5
        };
        ReactionTimeSession.prototype.getView = function() {
            var _ref;
            if (this.saving) {
                return "saving"
            } else {
                return ((_ref = this.currentTrial) != null ? _ref.phase : void 0) || "splash"
            }
        };
        // Get the average time of all the VALID trials
        ReactionTimeSession.prototype.getAverage = function() {
            var total, trial, _i, _len, _ref;
            total = 0;
            includedTrials = 0;
            _ref = this.trials;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                trial = _ref[_i];
                if (trial.include == true) {
                    total += trial.latency;
                    includedTrials++;
                }
            }
            return total / includedTrials || 0
        };
        ReactionTimeSession.prototype.getValidTrials = function() {            
            // Loop through the list and only addup the valid trials
            //return this.trials.length+1;
            return this.trialCount;
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
            this.trials.pop();
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
        ReactionTimeSession.prototype.hello = function(myname) {
            //disable the button to prevent multiple clicks
            $("#hellobutton").attr("disabled", "disabled");
            return "TESTING";
        };

        ReactionTimeSession.prototype.saveSession = function() {
           
            session = {};
            session.trials=[];
            trials = this.trials;

            // Is there anything to save? 
            if (trials.length == 0)
                return null;
           
            for(var i=0; i < trials.length; i++)
            {
                // Add this trial to the current session
                var trialObject = {};
                var trial = trials[i];

                trialObject.i = i+1;              // index
                trialObject.p = trial.problem;    // problem
                trialObject.a = trial.answer;     // answer
                trialObject.l = Math.round(trial.latency); // latency
                if (trial.include == true)      // include
                    trialObject.n = true;
                if (trial.correct == true)      // correct
                    trialObject.c = true;
                if (trial.warmup == true)       // warmup
                    trialObject.w = true;
                if (trial.correction == true)   // correction
                    trialObject.x = true;      
                session.trials.push(JSON.stringify(trialObject));
            }
            
            session.notes = "User needs to enter this somewhere."
            session.starttime = new Date(trials[0].starttime);
            session.endtime  = new Date(trials[trials.length-1].endtime);
            session.duration = Math.round((session.endtime - session.starttime)/1000);
            session.minlatency = 150;
            session.maxlatency = 3000;
            session.testtype = "A";
            session.testversion = 1;
            session.delay = Math.round( trials[0].delay );

            console.log("saveSession:", session );
            this.initialize();
            
            return dbService.addSession( session );
        };

        return ReactionTimeSession
    }()
})
