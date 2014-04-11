'use strict';

myApp.controller( "SessionsChartControl", function($scope, $rootScope, $filter, $window, $timeout, $q, $http,$location, 
	safeApply, ngTableParams, dbService) {

    var self = this;

    /////////////////////////////////////////////////////////////////
    this.getData = function() {

      var sessions = ($scope.dbService.sessions()) ? $scope.dbService.sessions() : [];
      var data=[];

      if (sessions.length == 0)
        data = [{x:0,y:0}];

      for(var i=0; i<sessions.length; i++) {
       //console.log("time: ", sessions[i].starttime.getTime()/1000 );
        data.push({
          x: sessions[i].starttime.getTime()/1000,
          y: sessions[i].latency,
          r: sessions[i].trials.stdev() / 8
        });
      }

      return data;
    };
    /////////////////////////////////////////////////////////////////
    var width = window.innerWidth - 40 - document.querySelector("#chart").offsetLeft * 2;
    
    var graph = new Rickshaw.Graph( {
      element: document.querySelector("#chart"),
      width:  width,
      height: 400,
      renderer: 'scatterplot',
      stroke: true,
      padding: { top: 0.05, left: 0.05, right: 0.05 },
      preserve: true,
      series: [ {
        name: '',
        className: 'scatterplot-circle',
        data: this.getData(), 
      } ]
      
    } );

    var xAxis = new Rickshaw.Graph.Axis.Time( { graph: graph,
       //       timeUnit: (new Rickshaw.Fixtures.Time()).unit('day')
    } );

    var yAxis = new Rickshaw.Graph.Axis.Y( {
        graph: graph,
        orientation: 'right',
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    } );

    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
        graph: graph,
      //  xFormatter: function(x) { return new Date(x*1000) },
      xFormatter: function(x) { return null },
   //     xFormatter: function(x) { return $filter('date')( x * 1000, 'medium') },
   //     yFormatter: function(y) { return Math.floor(y) + " (ms)" }
        formatter: function(series,x,y) {
          var date = '<span class="date">' + $filter('date')( x * 1000, 'medium') + '</span>';
          var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
          var content = swatch + series.name + "latency: " + parseInt(y) + ' (ms)<br>' + date;
          return content;
        }
    } );

    //////////////////////////////////////////////////
    var refreshChart = function() {

      if (document.querySelector("#chart") == null)
        return;

      console.log("refreshChart");
/*
      var element = document.querySelector("#chart");
      angular.forEach( element.children, function( child, key ) {
        child.remove();
      });
*/
      var width = window.innerWidth - 40 - document.querySelector("#chart").offsetLeft * 2;
      var frameHandleThickness = 20;

      var preview = new Rickshaw.Graph.RangeSlider.Preview({
        graph: graph,
        width: width + frameHandleThickness * 2,
        frameHandleThickness: frameHandleThickness,
        renderer: 'scatterplot',
        element: document.querySelector('#preview')
      });
 
      graph.configure({
        width: width,
        height: window.innerHeight - document.querySelector("#chart").offsetTop * 2,
      });

      graph.configure({renderer:'scatterplot'});
      graph.render();
    };

    var w = angular.element($window);
    //w.bind( "resize", refreshChart );
    
    ////////////////////////////////////////////////////////////////
    $scope.$on("sessionDataChanged", function() {
       // graph.series[0].data = self.getData();
        refreshChart();
    });

graph.render();
//refreshChart()
});
