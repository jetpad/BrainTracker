'use strict';

myApp.controller( "SessionsChartControl", function($scope, $rootScope, $filter, $timeout, $q, $http,$location, 
	safeApply, ngTableParams, dbService) {

    var self = this;

/////////////////////////////////////////////////////////////////
     function days(num) {
      return num*60*60*1000*24
    }

/////////////////////////////////////////////////////////////////
this.data = function(groups, points) {
  var data = [],
      shapes = ['circle','square'],
      random = d3.random.normal();

  for (var i = 0; i < groups; i++) {
    data.push({
      key: 'Group ' + i,
      values: []
    });

    for (var j = 0; j < points; j++) {
      data[i].values.push({
        x: new Date() - days(random()*365)
      , y: Math.abs(random() * 300)
      , size: Math.random()
      //, shape: shapes[j % 6]
      });
    }
  }

  return data;
}
    /////////////////////////////////////////////////////////////////
    var chart;


    nv.addGraph(function() {
   
    var customTimeFormat = d3.time.format.multi([
  [".%L", function(d) { return d.getMilliseconds(); }],
  [":%S", function(d) { return d.getSeconds(); }],
  ["%I:%M", function(d) { return d.getMinutes(); }],
  ["%I %p", function(d) { return d.getHours(); }],
  ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
  ["%b %d", function(d) { return d.getDate() != 1; }],
  ["%B", function(d) { return d.getMonth(); }],
  ["%Y", function() { return true; }]
]);

      chart = nv.models.scatterChart()
                    .showDistX(true)
                    .showDistY(true)
                    .color(d3.scale.category10().range());
/*
   chart.tooltipContent(function(key, x, y, e, graph) {return '<h3>' + key + '</h3>' +
               '<p>' +  y + '% in ' + x + '</p>'      })
          .showLegend(false)
          .showXAxis(false)
          .margin({top: 75, right: 250, bottom: 10, left: 38}) ;
  */   

var x = d3.time.scale();
   // .domain([new Date(2014, 0, 1), new Date( 2014,4,1 )])
  //  .range([0, width]);

 var margin = {top: 250, right: 40, bottom: 250, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
/*

      chart.xAxis
        .axisLabel('Date')
        .rotateLabels(-45)
        .scale(x)
       // .tickFormat(function(d) { return d3.time.format('%a %d')(new Date(d)); })
  //     .tickFormat(customTimeFormat);
        .tickFormat(function(d) { return d3.time.format('%Y')(new Date(d)); });
     //    .domain([new Date(2014,1,1), Date(2014,4,1)]).range([0, 450]);
*/

 chart.xAxis.tickSize(12)            
             .tickFormat(function(d) {
         console.log(d,arguments);
         var date = new Date(d);
               return d3.time.format('%b %y')(date);
             });


chart.xAxis.tickValues(d3.time.month.range(
                            new Date("2013 12"),
                            new Date("2014 04")),
                            1
                        );    


      chart.yAxis
        .axisLabel('latency')
        .tickFormat(d3.format('f'));

      d3.select('#chart svg')
        .datum(self.getData())
        .transition().duration(500)
        .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
    });
  /////////////////////////////////////////////////////////////////
	$scope.$watch("dbIsReady", function(newValue, oldValue, scope) {   
    	console.log("dbIsReady changed: ", newValue, oldValue, scope );
    	if (newValue != oldValue) {

    		    d3.select('#chart svg')
          .datum(self.getData())
          //.datum(self.data(1 ,40))
        .transition().duration(500)
          .call(chart);
    	}
	})
 /////////////////////////////////////////////////////////////////
	this.getData = function() {
    var sessions = ($scope.sessions) ? $scope.sessions : [];
    var groups = 1;
    var data = [],
    shapes = ['circle','square','triangle'],
    random = d3.random.normal();

    for (var i = 0; i < groups; i++) {
      data.push({
        key: 'Group ' + i,
        values: []
      });

      for (var j = 0; j < sessions.length; j++) {
        data[i].values.push({
          //x: new Date() - days(random()*365)
          x: sessions[j].startime,
          y: sessions[j].latency,
          size: 20 //Math.random()
          //, shape: shapes[j % 6]
        });
        console.log("Starttime: ", new Date(sessions[j].starttime));
      }
    }
  return data;
	};

});
