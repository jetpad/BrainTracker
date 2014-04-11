"use strict";

// Rickshaw Sparkline directive
//myApp.directive('ngSparkline', function() {
myApp.directive('ngSparkline', [function() {

  return {
    restrict: 'AE',
    require: '^ngModel',
    transclude: true,
    scope: {
    	ngModel: '='
    },
  
    template: '<div class="sparkline"></div>',
    link: function(scope, element, attrs) {

        var bins = attrs.bins ? attrs.bins : 12;

        scope.$watch(attrs.ngModel, function () {
            scope.refreshChart();
       //     console.log("Finished sparkline ngModel scope watch:", scope.getData());
        });

		/*  Histogram */
		scope.histogram = function( trials, bins ) {
            var data = [{x:0,y:0}];
            if (trials)
		        data = d3.layout.histogram().bins(bins)(trials.toArray());
	    	return data;
		};	

        /////////////////////////////////////////////////////////////////
        scope.getData = function() {
            return scope.histogram( scope.ngModel, bins );
        }

    	 var graph = new Rickshaw.Graph( {
            element: element.children()[0],
            width: attrs.width ? attrs.width : 80,
            height: attrs.height ? attrs.height : 20,
            renderer: 'bar', 
            min: 0, 
            series: [
                {
                    color: "#c05020",
                    data: scope.getData(),
                    name: 'Histogram'
                }
            ]
        } );

        scope.refreshChart = function() {
           // console.log("refreshChart:", scope.getData());
            graph.series[0].data = scope.getData();
            graph.render();        
        }

        scope.refreshChart();

        var yAxis = null
        if (graph.height >= 200)
             yAxis = new Rickshaw.Graph.Axis.Y( {
                graph: graph,
                orientation: 'right',
                tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
            } );
     
        var xAxis 
        if (graph.width >= 400)
            xAxis = new Rickshaw.Graph.Axis.X({
                graph: graph,
                ticks: bins,
                tickFormat: function(x) {
                    return (x).toString();
                }
            });       

/*
    	var hoverDetail = new Rickshaw.Graph.HoverDetail( {
        	graph: graph,
      		xFormatter: function(x) { return null },
        	formatter: function(series,x,y) {
     	     	var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
        	  	var content = swatch  + '(' + parseInt(y) + ') ' + parseInt(x) + ' ms <br>';
        	  	return content;
                //var data = d3.layout.histogram().bins(bins)(trials.toArray());
        	  	for(var i=0;i<series.data.length;i++)
        	  		content = content + "(" + series.data[i].y + ")  " + Math.round(series.data[i].x) +  " - "  + "?" + "<br/>";

          		return content;
        	}
 	   });
*/
        ////////////////////////////////////////////////////////////////
/*        $rootScope.$on("sessionDataChanged", function() {
            console.log("ngSparkline.sessionDataChanged");
            scope.initChart();
        });
*/  
    }
  }
}]);


