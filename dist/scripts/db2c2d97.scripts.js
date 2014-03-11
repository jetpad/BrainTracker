"use strict";function MainCtrl(a,b,c,d,e){a.dbService=e,e.initialize(),a.saveSession=function(){console.log("save session"),e.addSessionAndTrials(null,null)},a.displayMessage=function(a){$window.alert(a)},a.showContent=function(b){a.content=b;var c=e.parseCSVtoSessions(b);e.addSessions(c)}}var myApp=angular.module("myApp",["ui.bootstrap","angular-gestures","ngRoute"]);myApp.directive("onReadFile",["$parse",function(){return{restrict:"A",scope:{onReadFile:"&"},link:function(a,b){b.on("change",function(b){var c=new FileReader;c.onload=function(b){a.$apply(function(){a.onReadFile({$content:b.target.result})})},c.readAsText((b.srcElement||b.target).files[0])})}}}]),myApp.config(["$routeProvider","$locationProvider",function(a){a.when("/",{templateUrl:"views/main.html"}).when("/contact",{templateUrl:"views/contact.html"}).when("/about",{templateUrl:"views/about.html"}).when("/signout",{templateUrl:"views/signout.html"}).when("/results",{templateUrl:"views/results.html"}).when("/test",{templateUrl:"views/reaction-number.html"}).otherwise({redirectTo:"/"})}]),myApp.service("dbService",["$location","$q","safeApply","$rootScope",function(a,b,c,d){function e(a,b){return function(e,f){c(d,function(){e?(console.log('dbService "'+b+'" returned error',e),a.reject(e)):(console.log('dbService "'+b+'" returned successfully',f),a.resolve(f))})}}var f,g=null,h=null,i=null,j=null,k=this;this.initialize=function(){f=new Dropbox.Client({key:"46tjf8x15q98xic"}),this.authenticate({interactive:!1})},this.isAuthenticated=function(){return f.isAuthenticated()},this.isDatastoreOpen=function(){return!(null===g)},this.getDatastore=function(){return g},this.deleteDatastore=function(a){var c=b.defer();return h.deleteDatastore(a,e(c,"deleteDatastore")),c.promise},this.createDatastore=function(){var a=b.defer();return h.createDatastore(function(b,c){b?(console.log("Error creating datastore: "+b),a.reject(b)):(console.log("successfully created new datastore"),g=c,a.resolve(c))}),a.promise},this.authenticate=function(a){f.authenticate(a,function(a){a&&console.log("Authentication error: "+a)}),f.isAuthenticated()&&(h=f.getDatastoreManager(),h.openDefaultDatastore(function(a,b){a&&console.log("Error opening default datastore: "+a),g=b,i=g.getTable("session"),j=g.getTable("trial"),k.subscribeRecordsChanged(function(a){console.log("a session record has changed: ",a)},"session"),k.subscribeRecordsChanged(function(a){console.log("a trial record has changed: ",a)},"trial")}))};var l=function(a){return function(b){c(d,function(){a(b)})}};this.subscribeRecordsChanged=function(a,b){var c=function(){};return c=l(b?function(c){var d=c.affectedRecordsForTable(b);a(d)}:a),g.recordsChanged.addListener(c),c},this.addSessions=function(a){for(var b=0;b<a.length;b++)this.addSession(a[b])},this.addTrials=function(a,b){for(var c=0;c<b.length;c++)this.addTrial(a,b[c])},this.addTrial=function(){},this.addSession=function(a){var b=i.insert({notes:a.notes,starttime:a.starttime,endtime:a.endtime,minlatency:a.minlatency,maxlatency:a.maxlatency,testtype:a.testtype,testversion:a.testversion,delay:a.delay,duration:a.duration});this.addTrials(b.getId(),trials)},this.authenticatedNavigate=function(b){1==this.isAuthenticated()?a.path(b):this.authenticate()},this.signout=function(){g=null,0==this.isAuthenticated()?(console.log("not authenticated, signing out"),a.path("/signout")):(new function(){var a=b.defer();return f.signOut({mustInvalidate:!0},e(a,"signOut")),a.promise}).then(function(){console.log("signing out"),a.path("/signout")},function(){console.log("Error signing out"),a.path("/signout")})},this.CSVToArray=function(a,b){b=b||",";for(var c=new RegExp("(\\"+b+'|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\\'+b+"\\r\\n]*))","gi"),d=[[]],e=null;e=c.exec(a);){var f=e[1];if(f.length&&f!=b&&d.push([]),e[2])var g=e[2].replace(new RegExp('""',"g"),'"');else var g=e[3];d[d.length-1].push(g)}return d},this.parseCSVtoSessions=function(a){for(var b,c,d=this.CSVToArray(a),e=[],f={},g={},h=0;20>h;h++)console.log(d[h]);for(var h=1;h<d.length-1;h++){var i=d[h];i[2]!=c&&(c=i[2],e.push(f),f={},f.notes=c,f.starttime=this.parseDateFromR(i[1]),f.minlatency=150,f.maxlatency=3e3,f.testtype="SETH",f.testversion=1,f.delay=i[4],f.trials=[]),f.endtime=this.parseDateFromR(i[1]),f.duration=(f.endtime-f.starttime+i[6])/1e3,g={},g.idx=i[3],g.problem=i[5],g.answer=i[8],g.latencymsec=i[6],g.latencyptile=i[7],g.include="TRUE"==i[10],g.correct="TRUE"==i[9],g.warmup="warmup"==i[11],g.correction="correction trial"==i[11],f.trials.push(g),null!=b&&b>g[2]&&console.log("Error: 'when' column is not in ascending order."),b=g[2]}return e.push(f),e},this.parseDateFromR=function(a){var b=/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(.*)/,c=a.match(b);return new Date(Number(c[1]),Number(c[2]),Number(c[3]),Number(c[4]),Number(c[5]),Number(c[6]))}}]),myApp.factory("safeApply",[function(){return function(a,b){var c=a.$root.$$phase;"$apply"==c||"$digest"==c?b&&a.$eval(b):b?a.$apply(b):a.$apply()}}]);var mainCtrl=angular.module("MainCtrl",[]);myApp.factory("ReactionTimeTrial",["$timeout",function(a){var b;return b=function(){function b(){var b=this;this.minimumTime=100,this.maximumTime=2e3,this.phase="waiting",this.correction=!1,this.timeWaited=1500,this.latencyptile=null,a.cancel(this.delayPromise),this.delayPromise=a(function(){return b.enterGoPhase()},this.timeWaited)}return b.prototype.enterGoPhase=function(){if(!this.problem){var a=["2","3","4","5","6","7","8"];this.problem=a[Math.floor(Math.random()*a.length)]}return this.phase="go",this.startTime=new Date,this.startTime},b.prototype.reactionClick=function(){switch(a.cancel(this.delayPromise),this.endTime=new Date,this.latencymsec=this.endTime-this.startTime,this.phase="result",this.startTime||(this.phase="too-fast"),this.endTime-this.startTime<this.minimumTime&&(this.phase="too-fast"),this.endTime-this.startTime>this.maximumTime&&(this.phase="too-slow"),this.answer!=this.problem&&(console.log("wrong-number!!!"),this.phase="wrong-number"),this.phase){case"too-fast":this.correct=!1;break;case"too-slow":this.correct=!1;break;case"wrong-number":this.correct=!1;break;default:console.log("TRIAL: ",angular.toJson(this)),this.correct=!0,this.include=!0}return this.latencymsec},b}()}]).factory("ReactionTimeSession",["ReactionTimeTrial","$http",function(a){var b;return b=function(){function b(){this.initialize()}return b.prototype.initialize=function(){this.trials=[],this.currentTrial=null,this.trialCount=0,this.correctionTrial=!1,this.warmup=!1,this.maxTrials=4},b.prototype.start=function(){return this.nextTrial()},b.prototype.nextTrial=function(){var b=new a(this);return 1==this.correctionTrial&&(b.problem=this.currentTrial.problem,b.correction=!0),b.include=1==this.warmup||1==this.correctionTrial?!1:!0,0==b.include&&console.log("NOT INCLUDING the _nextTrial"),this.currentTrial=b},b.prototype.clickedBg=function(){return this.getView()},b.prototype.clickedNumber=function(a){switch(this.currentTrial&&(this.currentTrial.answer=a?a:String.fromCharCode(event.keyCode)),this.getView()){case"splash":return this.start();case"waiting":return this.reactionClick();case"go":return this.reactionClick();default:return this.nextTrial()}},b.prototype.reactionClick=function(){if(this.currentClickTime=new Date,Math.abs(this.currentClickTime-this.lastClickTime)<300)return this.getView();switch(this.lastClickTime=this.currentClickTime,console.log("session.reactionClick: ",this.currentTrial.phase),this.currentTrial.reactionClick(),console.log("trial.reactionClick: ",this.currentTrial.phase),this.currentTrial.phase){case"too-fast":case"too-slow":case"wrong-number":this.correctionTrial=!0;break;case"result":default:1==this.currentTrial.include?(console.log(" Including the trial"),0==this.correctionTrial&&(this.trialCount=this.trialCount+1),this.correctionTrial=!1,this.currentTrial.delayPromise=null,console.log("TRIALS: ",angular.toJson(this.trials,!0),",")):(console.log(" Excluding the trial"),this.correctionTrial=!0)}return this.trials.push(this.currentTrial)},b.prototype.showSaveButton=function(){return this.trials.length>=5},b.prototype.getView=function(){var a;return this.saving?"saving":(null!=(a=this.currentTrial)?a.phase:void 0)||"splash"},b.prototype.getAverage=function(){var a,b,c,d,e;for(a=0,includedTrials=0,e=this.trials,c=0,d=e.length;d>c;c++)b=e[c],1==b.include&&(a+=b.latencymsec,includedTrials++);return a/includedTrials||0},b.prototype.getValidTrials=function(){return this.trialCount},b.prototype.getMaxTrials=function(){var a=this.maxTrials;return a},b.prototype.getProblem=function(){var a=0;return this.currentTrial&&this.currentTrial.problem&&(a=this.currentTrial.problem),a},b.prototype.getNumberClass=function(a){return this.currentTrial&&this.currentTrial.answer&&this.currentTrial.answer!=this.getProblem()&&a==this.currentTrial.answer?"number-wrong":a!=this.getProblem()?"number-disabled":"waiting"==this.getView()?"number-disabled":"number-selected"},b.prototype.cancelLastTrial=function(){console.log("Cancel Last Trial"),this.trials.pop()},b.prototype.endSession=function(){console.log("End Session"),this.initialize()},b.prototype.setMessage=function(a){this.message=a},b.prototype.getMessage=function(){return this.message},b.prototype.hello=function(){return $("#hellobutton").attr("disabled","disabled"),"TESTING"},b.prototype.saveSession=function(){console.log("saveSession"),$("#savebutton").attr("disabled","disabled");var a="[Here is the session data.]";this.saveResult="Trying to save.";var b=ocpu.rpc("saveSession",{thesessiondata:a},function(a){this.saveResult=a});return b.fail(function(){alert("Server error: "+b.responseText)}),b.always(function(){$("#submitbutton").removeAttr("disabled")}),"TESTING"},b}()}]),myApp.controller("ReactionTimeCtrl",["$scope","ReactionTimeSession",function(a,b){return a.test=new b,a.test.hello=function(){var b;b.then(function(b){a.test.message=b.message[0],console.log("result.message[0]:",b.message[0]," result:",b)},function(a){console.log("hello status:",a)})},a.test.saveTrials=function(){{var a;this.trials}a.then(function(a){console.log("saveTrials:",a)},function(a){console.log("saveTrials status:",a)})},a.test}]);var overwriteWithout=function(a,b){for(var c=a.length;c>=0;c--)a[c]===b&&a.splice(c,1)},isSet=function(a,b){return _.isUndefined(b)?!1:""===b?!0:a.$eval(b)};myApp.factory("shortcuts",["$document",function(a){var b=[],c={"delete":8,tab:9,enter:13,"return":13,esc:27,space:32,left:37,up:38,right:39,down:40,";":186,"=":187,",":188,"-":189,".":190,"/":191,"`":192,"[":219,"\\":220,"]":221,"'":222},d=function(a,b){for(var d=a.length,e=0;d>e;e++)c[a[e]]=b+e};d("1234567890",49),d("abcdefghijklmnopqrstuvwxyz",65);var e={};_.forEach(c,function(a,b){e[a]=b});var f={shift:"shift",ctrl:"ctrl",meta:"meta",alt:"alt"},g=function(a){var b=a.split("+"),d={};return _.forEach(f,function(a){d[a]=!1}),_.forEach(b,function(a){var b=f[a];if(b)d[b]=!0;else if(d.keyCode=c[a],!d.keyCode)return}),d},h=function(a){var b={};return b.keyCode=c[e[a.which]],b.meta=a.metaKey||!1,b.alt=a.altKey||!1,b.ctrl=a.ctrlKey||!1,b.shift=a.shiftKey||!1,b},i=function(a,b){return a.keyCode===b.keyCode&&a.ctrl===b.ctrl&&a.alt===b.alt&&a.meta===b.meta&&a.shift===b.shift};return a.bind("keydown",function(a){var c=$(a.target);if(!c.is('input[type="text"], textarea'))for(var d,e=h(a),f=b.length-1;f>=0;f--)if(d=b[f],i(e,d.keys))return a.preventDefault(),void d.action()}),{shortcuts:b,register:function(a){return a.keys=g(a.keySet),a.keys?(b.push(a),a):void 0},unregister:function(a){overwriteWithout(b,a)}}}]),myApp.directive("ngShortcut",["$parse","shortcuts",function(a,b){return{restrict:"A",link:function(c,d,e){var f=c.$eval(e.ngShortcut);if(!_.isUndefined(f)){f=f.split("|");var g=_.ignore,h=function(a){return function(){d.trigger(a)}};if(isSet(c,e.ngShortcutClick))g=h("click");else if(isSet(c,e.ngShortcutFocus))g=h("focus");else if(isSet(c,e.ngShortcutFastClick))g=h("click");else if(e.ngShortcutNavigate){var i=c.$eval(e.ngShortcutNavigate);g=function(){navigation.redirect(i,!0)}}else if(e.ngShortcutAction){var j=a(e.ngShortcutAction);g=function(){c.$apply(function(){j(c)})}}_.forEach(f,function(a){var d=b.register({keySet:a,action:g,description:e.ngShortcutDescription||""});c.$on("$destroy",function(){b.unregister(d)})})}}}}]);