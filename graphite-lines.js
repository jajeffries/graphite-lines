(function (window) {

    function graphiteline(selector, options) {
        var options = options || {},
            height = options.height || 200,
            width = options.width || 300,
            padding = options.padding || 60,
            grid = options.grid || true,
            area = options.area || true,
            lineData = options.data;
        
        var svg = d3.select(selector)
                             .append("svg")
                             .attr("width", width)
                             .attr("height", height);

        var xScale = d3.scale.linear()
                                .range([0, width+padding])
                                .domain(d3.extent(lineData[0].datapoints, function(d) { return d[1]; }));

        var yScale = d3.scale.linear()
                                .range([height-padding, 0])
                                .domain(d3.extent(lineData[0].datapoints, function(d) { return d[0]; }));

        var xAxis = d3.svg.axis()
                          .scale(xScale)
                          .ticks(5)
                          .tickFormat(function(d) { 
                              var date = new Date(d); 
                              return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(); 
                          })
                          .orient("bottom");

        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(" + padding + "," + (height-padding) + ")")
           .call(xAxis);

        var yAxis = d3.svg.axis()
                          .scale(yScale)
                          .orient("left")
                          .ticks(10);

        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(" + padding + ",0)")
           .call(yAxis);

        if(grid) {
            svg.append("g")         
                    .attr("class", "grid")
                    .attr("transform", "translate(0," + (height-padding) + ")")
                    .call(xAxis
                            .tickSize(-height, 0, 0)
                            .tickFormat("")
                    );

            svg.append("g")         
                    .attr("class", "grid")
                    .attr("transform", "translate(" + padding + ",0)")
                    .call(yAxis
                            .tickSize(-width, 0, 0)
                            .tickFormat("")
                    );
        }

        if(area) {
            var area = d3.svg.area()
                            .x(function(d) { return xScale(d[1]); })
                            .y0(height-padding)
                            .y1(function(d) { return yScale(d[0]); });

            svg.append("path")
                    .datum(lineData[0].datapoints)
                    .attr("class", "area")
                    .attr("transform", "translate(" + padding + ",0)")
                    .attr("d", area);
        }

        var lineFunction = d3.svg.line()
                               .x(function(d, i) { return xScale(d[1]) + padding; })
                               .y(function(d, i) { return yScale(d[0]); })
                               .interpolate("linear");

        svg.append("path")
           .attr("d", lineFunction(lineData[0].datapoints))
           .attr("stroke", "blue")
           .attr("stroke-width", 2)
           .attr("fill", "none");
    }
    window.graphiteline = graphiteline;
})(window);