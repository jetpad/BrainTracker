'use strict';

myApp.controller( "SessionsChartControl", function($scope, $rootScope, $filter, $timeout, $q, $http,$location, 
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
          y: sessions[i].latency
        });
      }

      return data;
    };
    /////////////////////////////////////////////////////////////////
    var graph = new Rickshaw.Graph( {
      element: document.querySelector("#chart"),
      width: 800,
      height: 400,
      renderer: 'scatterplot',
      stroke: true,
      padding: { top: 0.05, left: 0.05, right: 0.05 },
      preserve: true,
      series: [ {
        name: '',
        data: this.getData(), 
        color: 'steelblue'
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
          var content = swatch + series.name + " " + parseInt(y) + ' (ms)<br>' + date;
          return content;
        }
    } );

    var preview = new Rickshaw.Graph.RangeSlider.Preview({
        graph: graph,
        padding: { left: 40 },
        renderer: 'scatterplot',
        element: document.querySelector('#preview')
    });

    var ticksTreatment = 'glow';
    var previewXAxis = new Rickshaw.Graph.Axis.Time({
      graph: preview.previews[0],
      timeFixture: new Rickshaw.Fixtures.Time.Local(),
      ticksTreatment: ticksTreatment
    });
    
    previewXAxis.render();

    graph.configure({renderer:'scatterplot'});
    
    graph.render();

    ////////////////////////////////////////////////////////////////
    $scope.$on("sessionDataChanged", function() {
        console.log("Updating Chart");
        graph.series[0].data = self.getData();
        xAxis.render();
        yAxis.render();
        graph.render();
    });
});
