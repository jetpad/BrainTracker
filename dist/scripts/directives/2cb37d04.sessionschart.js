"use strict";

//myApp.directive('ngSessionschart', function($window,$rootScope,$filter) {
myApp.directive('ngSessionschart', ['$window','$rootScope','$filter',function($window,$rootScope,$filter) {

  return {
    restrict: 'AE',
    template: '<div class="sessionschart" id="chart"></div><div id="slider"></div>',
 //   scope: {
 //       range: '='
 //   },

    link: function(scope, element, attrs) {

        var no_data = [{x:0,y:0,r:10}];

        var pTile = attrs.ptile ? ((angular.lowercase(attrs.ptile) == 'true')) : false;

console.log("range:", scope.range );

//console.log("attrs.pTile:", attrs.ptile, pTile );

        /////////////////////////////////////////////////////////////////
        scope.getData = function() {
            console.log("ngSessionsChart.scope.getData");
        
      //      if (typeof scope.dbService == 'undefined')
      //          return no_data;

            var sessions = scope.dbService.sessions() ? scope.dbService.sessions() : [];
            var data=[];

           if (sessions.length == 0)
                data = no_data;

            for(var i=0; i<sessions.length; i++) {
                data.push({
                    x: sessions[i].starttime.getTime()/1000,
                    y: sessions[i].latency,
                    r: sessions[i].trials.stdev() / 8
                });
            }
            return data;
        };      
        /////////////////////////////////////////////////////////////////
        scope.ptileCalc = function( latencyArr, latency ) {

            for (var i = 0; i < latencyArr.length; i++) {
                if (latencyArr[i] > latency) {
                    return Math.round(( i / latencyArr.length) * 100);
                }
            }
            
            return 100
        }
        /////////////////////////////////////////////////////////////////
        scope.getPtileData = function(starttime,endtime) {

//console.log("starttime:", starttime );
//console.log("endtime:", endtime );

     //       if (typeof scope.dbService == 'undefined')
     //           return no_data;

            var sessions = scope.dbService.sessions() ? scope.dbService.sessions() : new gauss.Vector();
            var data=[];
            if (sessions.length == 0) {
                return no_data;
            }

     //       console.log("ngSessionsChart.scope.getPtileData:", sessions.length);

            var start = (typeof starttime != 'undefined') ? new Date(starttime*1000): sessions[0].starttime; 
            var end   = (typeof endtime   != 'undefined') ? new Date(endtime*1000)  : sessions[sessions.length-1].endtime;

//console.log(" startime:", start );
//console.log(" endtime: ", end );

            // Get the filtered (by time) trial latencies in a vector
            var latencies = sessions
                .find( function(e) { return ((e.starttime >= start) && (e.endtime <= end)) })
                .map(function(session) { return session.latency })
                .sort();
//
//console.log("latencies:", latencies.length, " sessions:", sessions.length );
//console.log("latencies:", latencies );
            // go through the sessions and establish a ptile from the sorted filtered trial latency
            // by finding the index of the highest latency that is less than the given latency.
         


            for(var i=0; i<sessions.length; i++) {
/*
                for(var x=0; x < sessions[i].trials.length; x++) {              
                    data.push({
                        x: sessions[i].starttime.getTime()/1000,
                        y: sessions[i].trials[x],
                        r: 1// sessions[i].trials.stdev() / 8
                    });
                }   

*/              
                var y;
                if ((sessions[i].starttime >= start) && (sessions[i].endtime <= end))
                    y = scope.ptileCalc( latencies, sessions[i].latency);
                else
                    y = sessions[i].ptile;

                data.push({
                    x: sessions[i].starttime.getTime()/1000,
                    y: y,
                    r: sessions[i].trials.stdev() / 8,
                    latency: sessions[i].latency,
                    i: i
                }); 
                
            }
            return data;
        };

        /////////////////////////////////////////////////////////////////
        //This should be delayed until the page has finished rendering
             var width = window.innerWidth * .9;
        var frameHandleThickness = 20;
       // var height = window.innerHeight - element.children()[0].offsetTop * 2;
         var height = window.innerHeight * .6;

     	var graph = new Rickshaw.Graph( {
            element: element.children()[0],
            width: width,
            height: height, //attrs.height ? attrs.height : 400,
            renderer: 'scatterplot',
            min: 0,
            series: [
                {
                    color: "#c05020",
                    data: [{x:0,y:0,r:10}], //(pTile) ? scope.getPtileData() : scope.getData(),
                    className: 'scatterplot-circle',
                    name: '',
                }
            ]
        } );

    var xAxis = new Rickshaw.Graph.Axis.Time( { graph: graph,
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
        formatter: function(series,x,y,fx,fy,p) {
            var index = p.value.i;
            var latency = p.value.latency;

            // (series, point.value.x, actualY, formattedXValue, formattedYValue, point);
          //  return "x:" + parseInt(x) + " y:" + parseInt(y) +  " i:" + p.value.i + " fy:" + parseInt(fy) + " p:" + p.order;
            var date = '<span class="date">' + $filter('date')( x * 1000, 'medium') + '</span>';
            var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
            if (pTile)
                return swatch + series.name + "latency: " + parseInt(latency) + ' (ms)<br>' + 
                        " percentile rank: " + parseInt(y) + "%<br>" + date;
            else
                return swatch + series.name + "latency: " + parseInt(y) + ' (ms)<br>' + date;
        }
    } );
    ////////////////////////////////
      
        scope.createPreviewSlider = function(width) {   
            var preview = new Rickshaw.Graph.RangeSlider.Preview({
                graph: graph,
                width: width + frameHandleThickness * 2,
                frameHandleThickness: frameHandleThickness,
                renderer: 'scatterplot',
                element: element.children()[1],
            });    

            preview.onSlide(function(graph, xmin, xmax) { 
                  // console.log("onslide - xmin:", new Date(xmin*1000), " xmax:", new Date(xmax*1000));

                    graph.series[0].data = (pTile) ? scope.getPtileData(xmin,xmax) : scope.getData();

                    scope.$parent.range = [xmin,xmax];
              //      scope.range.min = xmin;
              //      scope.range.max = xmax;
                });
        }

        /////////////////////////////////////////////////////////////////
        scope.resizeChart = function() {

            var height = window.innerHeight - element.children()[0].offsetTop * 2;
            height = (height > 0) ? height : 0;

            graph.configure({
     //            width: width,
                 height: height,
            });
        }

        scope.initChart = function() {
            //scope.resizeChart()

            graph.series[0].data = (pTile) ? scope.getPtileData() : scope.getData();
            scope.createPreviewSlider(width);
            graph.configure({renderer:'scatterplot'});
            graph.render();        
        }

        scope.initChart();
        var w = angular.element($window);
       // w.bind( "resize", scope.resizeChart );
    
        ////////////////////////////////////////////////////////////////

        $rootScope.$on("sessionDataChanged", function() {
            console.log("SESSIONSCHART.sessionDataChanged");
            scope.initChart();
        });

    }
  }
}]);


