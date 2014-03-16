'use strict';

var myApp = angular.module('myApp', 
    ['ui.bootstrap', 'ngTable',
     'angular-gestures','ngRoute' ]);
/*
<div ng-controller="MainCtrl" class="container">
  <h1>Select text file</h1>
    <input type="file" on-read-file="showContent($content)" />
    <div ng-if="content">
        <h2>File content is:</h2>
        <pre>{{ content }}</pre>
    </div>
</div>
*/
/*
myapp.controller('MainCtrl', function ($scope) {
    $scope.showContent = function(content){
        $scope.content = content;
    };
  });
};
*/

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

