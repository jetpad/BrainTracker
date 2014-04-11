'use strict';

var myApp = angular.module('myApp', 
    ['ui.bootstrap', 'ngTable', 'xeditable', 'angular-gestures', 'ui.router', 'ngSanitize' ]);

myApp.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

myApp.directive('onReadFile', function ($parse) {
  return {
    restrict: 'A',
        scope: {
            onReadFile : "&"
        },
    link: function(scope, element, attrs) {
      element.on('change', function(e) {
        var reader = new FileReader();
        reader.onload = function(e) {
          scope.$apply(function() {
                       scope.onReadFile({$content:e.target.result});
          });
        };
        reader.readAsText((e.srcElement || e.target).files[0]);
      });
    }
  };
});

// <input type="text" ng-model="json" />
// <ng-download text="Download" id="content" filetype="text/csv" />
myApp.directive('ngDownloadCsv', function ($compile, $sce, dbService) {
    return {
      restrict: 'AE',
      template: '<a></a>',
     
        link:function (scope, elm, attrs) {

            var title     = attrs.title ? attrs.title : "Download";
            var filename  = attrs.filename ? attrs.filename : "data.txt";
            var trials    = attrs.trials ? attrs.trials : true;

            scope.getUrl = function(){
                return $sce.trustAsResourceUrl(URL.createObjectURL(new Blob([dbService.exportToCSV(trials)], {type: "text/csv"})));
            }

           if (dbService.ready()) {
              // Data is ready
              elm.children()[0].href = scope.getUrl();
              elm.children()[0].innerHTML = title;
              elm.children()[0].target = "_blank";
              elm.children()[0].download = filename;
            }
            else {
              // Data isn't available yet. 
              elm.children()[0].href = "";
              elm.children()[0].innerHTML = "Loading...";
              elm.children()[0].download = filename;
            }
    /*   
            elm.append($compile(
                    '<a class="btn" download="' + filename + '"' + ' href="' + scope.getUrl() + '">' + title + '</a>'
            )(scope));                    
     */
          scope.$on("sessionDataChanged", function() {
            console.log("Export.sessionDataChanged");
              elm.children()[0].href = scope.getUrl();
              elm.children()[0].target = "_blank";
              elm.children()[0].innerHTML = title;
              elm.children()[0].download = filename;
          });
       
        }
    };
});

var now = (function() {
  // Returns the number of milliseconds elapsed since either the browser navigationStart event or 
  // the UNIX epoch, depending on availability.
  // Where the browser supports 'performance' we use that as it is more accurate (microsoeconds
  // will be returned in the fractional part) and more reliable as it does not rely on the system time. 
  // Where 'performance' is not available, we will fall back to Date().getTime().
  var performance = window.performance || {};
  performance.now = (function() {
    return performance.now    ||
    performance.webkitNow     ||
    performance.msNow         ||
    performance.oNow          ||
    performance.mozNow        ||
    function() { return new Date().getTime(); };
  })();
  return performance.now();         
});
