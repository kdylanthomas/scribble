'use strict';

app.directive('sentiMeter', function () { 
	let width = 250; 
    let height = 250; 
    let radius = Math.min(width, height) / 2;
    let twoPi = 2 * Math.PI;
	
	return {
		restrict: 'E',
		scope: {
			sentiment: '=',
		},
		link: function (scope, element, attrs) {

			scope.$watch('sentiment', function (sentiment) {
				var sentiment = scope.sentiment;

				if (sentiment == null) return;
				console.log('this is the data in the sentiment directive: ', sentiment);

				let arc = d3.svg.arc()
				    .innerRadius(radius - 70)
				    .outerRadius(radius - 10)
				    .startAngle(0);
				 
				let svg = d3.select(element[0]).append("svg")
				    .attr("width", width)
				    .attr("height", height)
				  	.append("g")
				    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

				svg.selectAll('*').remove();

				let meter = svg.append("g")
				    .attr("class", "season-progress");
				 
				let background = meter.append("path")
				    .datum({endAngle: twoPi})
				    .style("fill", "#E9E5E5")
				    .attr("d", arc);
				 
				let foreground = meter.append("path")
				    .datum({endAngle:0})
				    .style("fill", "#CAE7B9")
				    .attr("d", arc);
				 
				  foreground.transition()
				    .duration(1000)
				    .ease("linear")
				    .attrTween("d", function(d) {
			               let interpolate = d3.interpolate(d.endAngle, twoPi * sentiment["actual"] / sentiment["total"])
			               return function(t) {
			                  d.endAngle = interpolate(t);
			                  return arc(d);
			               }  
		            	});

				  let text =  meter.append("text")
				    .attr("text-anchor", "middle")
				    .attr("dy", ".35em")
				    .attr("font-size", "24")
				    .attr("font-family", "Shadows Into Light Two")
				    .text(sentiment["actual"].toFixed(2) * 100 + '%');
			});
		}
	}
});