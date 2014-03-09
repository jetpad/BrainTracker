myApp.factory("ReactionTimeTrial", function($timeout) {
    var ReactionTimeTrial;
    return ReactionTimeTrial = function() {
        function ReactionTimeTrial(test) {
            var _this = this;
            this.minimumTime = 100;
            this.maximumTime = 2000;
            //this.startedWaitingTime = new Date;
            this.phase = "waiting";
            this.correction = false; 
           // this.timeWaited=~~(1500 + Math.random() * 2000);
            this.timeWaited=1500;
            this.latencyptile = null;

            $timeout.cancel(this.delayPromise);
            this.delayPromise = $timeout(function() {
                return _this.enterGoPhase()
            }, this.timeWaited)

        }
        ReactionTimeTrial.prototype.enterGoPhase = function() {

            // If this isn't a correction trial and so the problem has already been selected
            if (!this.problem) {
                // Pick a random number 2-4,6-8 for the trial
                var myArray=['2','3','4','5','6','7','8'];
                this.problem = myArray[Math.floor(Math.random() * myArray.length)];
            }
   
            this.phase = "go";
            this.startTime = new Date
            // Save the start time so that the elapsed time counter can get to it
            // Probably not the right play/way to save it.
            //$rootScope.startTime = this.startTime;
            return this.startTime;
        };
   
        ReactionTimeTrial.prototype.reactionClick = function() {
            $timeout.cancel(this.delayPromise);
            this.endTime = new Date;

            // Time of the result
            this.latencymsec = this.endTime - this.startTime;
            // It was a success and show the "result" (unless found otherwise)
            this.phase = "result";
       
            if (!this.startTime) 
                this.phase = "too-fast";
            
            if ((this.endTime - this.startTime) < this.minimumTime) 
                this.phase = "too-fast";

            if ((this.endTime - this.startTime) > this.maximumTime)
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

            return this.latencymsec;
            
        };
       
        return ReactionTimeTrial
    }()
}).factory("ReactionTimeSession", function(ReactionTimeTrial, $http) {
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
                    total += trial.latencymsec;
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
/*
             //perform the request
            var req = ocpu.rpc("hello", {
              myname : myname
            }, function(output){
                scope.$apply(function() {
                    scope.message = output.message;

                    console.log("message:", scope.message );
                });
            });

            var req = ocpu.rpc("hello", {
              myname : myname
            }, function(output){
                this.setMessage( "HI" );
                console.log("message:", this.message);
            });
            
            //if R returns an error, alert the error message
            req.fail(function(){
              alert("Server error: " + req.responseText);
            });
            
            //after request complete, re-enable the button 
            req.always(function(){
                $("#hellobutton").removeAttr("disabled")
            });
*/
            return "TESTING";
        };

        ReactionTimeSession.prototype.saveSession = function() {

            console.log("saveSession");

            //disable the button to prevent multiple clicks
            $("#savebutton").attr("disabled", "disabled");
 
            var thesessiondata = "[Here is the session data.]";
            this.saveResult = "Trying to save.";
            //perform the request
            var req = ocpu.rpc("saveSession", {
              thesessiondata : thesessiondata
            }, function(output){
                this.saveResult = output;
            });
            
            //if R returns an error, alert the error message
            req.fail(function(){
              alert("Server error: " + req.responseText);
            });
            
            //after request complete, re-enable the button 
            req.always(function(){
                $("#submitbutton").removeAttr("disabled")
            });

            return "TESTING";
        };

        return ReactionTimeSession
    }()
})
