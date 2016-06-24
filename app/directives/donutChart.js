'use strict';

app.directive('donutChart', function () { 
	let width = 250;
    let height = 250;
    let radius = Math.min(width, height) / 2;
	let color = d3.scale.ordinal()
    .range(["#CAE7B9", "#F3DE8A", "#EB9486", "#7E7F9A", "#97A7B3"]);

	return {
		restrict: 'E',
		scope: {
			data: '=',
		},
		link: function (scope, element, attrs) {

			scope.$watch('data', function (data) {
				if (data == null) return;

				var data = scope.data; // note to self, this is crucial; also these can't be block scoped
				
				console.log('this is the data in the emotion directive: ', data);

				let arc = d3.svg.arc()
				    .outerRadius(radius - 10)
				    .innerRadius(radius - 70);

				let pie = d3.layout.pie()
				    .sort(null)
				    .value(function (d) {
				    return d.value;
				});

			    let svg = d3.select(element[0]).append("svg")
				    .attr("width", width)
				    .attr("height", height)
				    .append("g")
				    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			    svg.selectAll('*').remove();

			    let g = svg.selectAll(".arc")
			        .data(pie(data))
			        .enter().append("g")
			        .attr("class", "arc");

			    g.append("path")
			        .attr("d", arc)
			        .style("fill", function (d) {
			        return color(d.data.emotion);
			    });

			    g.append("text")
			        .attr("transform", function (d) {
			        return "translate(" + arc.centroid(d) + ")";
			    })
			        .attr("dy", ".35em")
			        .style("text-anchor", "middle")
			        .attr("color", "white")
			        .style("font-family", "Dosis")
			        .text(function (d) {
			        return d.data.emotion;
			    });

			});
		}
	}
});