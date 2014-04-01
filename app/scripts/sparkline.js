"use strict";

// Rickshaw Sparkline directive
myApp.directive('ngSparkline', function() {

  return {
    restrict: 'AE',
    require: '^ngModel',
    scope: {
    	ngModel: '='
    },
    template: '<div class="sparkline"></div>',
    link: function(scope, element, attrs) {

		scope.dummydata = function() {
			var seriesData = [ [], [], [] ];
	        var random = new Rickshaw.Fixtures.RandomData(150);
	        for (var i = 0; i < 150; i++) {
	            random.addData(seriesData);
	        }
	        return seriesData[0];
		};

		/*  Histogram */
		scope.histogram = function( trials, bins ) {
			var data = d3.layout.histogram().bins(bins)(trials.toArray());
	    	return data;
		};	
	
    	 var graph = new Rickshaw.Graph( {
            element: element.children()[0],
            width: attrs.width ? attrs.width : 80,
            height: attrs.height ? attrs.height : 20,
            renderer: 'bar',
            min: 'auto',
            series: [
                {
                    color: "#c05020",
                    data: scope.histogram( scope.ngModel, attrs.bins ? attrs.bins : 12 ),
                    name: 'Histogram'
                }
            ]
        } );
    
    	graph.render();
/*
    	var hoverDetail = new Rickshaw.Graph.HoverDetail( {
        	graph: graph,
      		xFormatter: function(x) { return null },
        	formatter: function(series,x,y) {
     	     	var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
        	  	var content = ""; //swatch  + '(' + parseInt(y) + ') ' + parseInt(x) + ' <br>';
        	  	//var data = d3.layout.histogram().bins(bins)(trials.toArray());
        	  	for(var i=0;i<series.data.length;i++)
        	  		content = content + "(" + series.data[i].y + ")  " + Math.round(series.data[i].x) +  " - "  + "?" + "<br/>";

          		return content;
        	}
 	   });
*/
    }
  }
});


