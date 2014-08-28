(function (window) {
    
    function epochDateFormat(d) {
      var date = new Date(d); 
      return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }

    function graphiteline(selector, options) {
        var options = options || {},
            height = options.height || 200,
            width = options.width || 300,
            padding = options.padding || 60,
            grid = options.grid || true,
            area = options.area || true,
            lineData = options.data || [],
            dataLabels = options.dataLabels || true,
            mouseoverLabels = options.mouseoverLabels || true,
            allLineData = [].concat.apply([], options.data.map(function (d) {
              return d.datapoints;
            }));
        
        var svg = d3.select(selector)
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

        var xScale = d3.scale.linear()
                                .range([0, width+padding])
                                .domain(d3.extent(allLineData, function(d) { return d[1]; }));

        var yScale = d3.scale.linear()
                                .range([height-padding, 0])
                                .domain(d3.extent(allLineData, function(d) { return d[0]; }));


        var xAxis = d3.svg.axis()
                          .scale(xScale)
                          .ticks(5)
                          .tickFormat(epochDateFormat)
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

        drawSeries(svg, lineData, area, padding, height, mouseoverLabels, dataLabels, xScale, yScale);
    }


    function drawSeries(svg, lineData, showArea, padding, height, mouseoverLabels, showDataLabels, xScale, yScale) {
      for(var i=0; i<lineData.length; i++) {

          drawArea(showArea, svg, lineData[i].datapoints, padding, height, xScale, yScale);

          var path = drawPath(svg, lineData[i].datapoints, padding, xScale, yScale);

          if(mouseoverLabels) {
            var circle = svg
                          .append("circle")
                          .attr("r", "10px")
                          .style("stroke-width", "2px")
                          .style("stroke", "darkblue")
                          .style("fill", "lightsteelblue")
                          .style("opacity", "0.7")
                          .on('mouseleave', function () {
                            circle.style("display", "none");
                          });
            path
              .on('mouseenter', function () {
                var rangeX = d3.event.x,
                    rangeY = d3.event.y,
                    epoch = xScale.invert(rangeX),
                    reading = yScale.invert(rangeY);
                circle
                    .style("display", "block")
                    .attr("cx", rangeX - 10)
                    .attr("cy", rangeY - 10);
                addDataLabels(svg, circle, showDataLabels, xScale, yScale);
              });

            
          }

          addDataLabels(svg, path, showDataLabels, xScale, yScale);
        }
    }

    function addDataLabels(svg, object, showDataLabels, xScale, yScale) {
      if(showDataLabels) {
        object
         .on('mousedown', function() {
            var rangeX = d3.event.x,
                rangeY = d3.event.y,
                epoch = xScale.invert(rangeX),
                reading = yScale.invert(rangeY);
            svg.select("circle.datapoint").remove();
            svg
              .append("circle")
              .attr("cx", (rangeX - 10) + "px")
              .attr("cy", (rangeY - 10) + "px")
              .attr("r", "10px")
              .style("stroke-width", "2px")
              .style("stroke", "darkblue")
              .style("fill", "lightsteelblue")
              .style("opacity", "0.7")
              .classed("datapoint", true);

            svg.select("rect.datapoint-label").remove();
            var label = svg
                        .append("rect")
                        .attr("x", (rangeX + 10) + "px")
                        .attr("y", (rangeY - 20) + "px")
                        .attr("width", "80px")
                        .attr("height", "20px")
                        .style("stroke-width", "2px")
                        .style("stroke", "darkblue")
                        .style("fill", "lightsteelblue")
                        .style("opacity", "0.7")
                        .classed("datapoint-label", true);
            
            svg.select("text.datapoint-label-text").remove();
            label
              .append("text")
              .attr("x", rangeX + "px")
              .attr("y", rangeY + "px")
              .attr("dy", "0.35em")
              .text(function () {
                return Math.floor(reading) + " - " + epochDateFormat(Math.floor(epoch));
              });
         });
      }
    }

    function drawArea(showArea, svg, datapoints, padding, height, xScale, yScale) {
      if(showArea) {
        var area = d3.svg.area()
                        .x(function(d) { return xScale(d[1]); })
                        .y0(height-padding)
                        .y1(function(d) { return yScale(d[0]); });

        svg.append("path")
                .datum(datapoints)
                .attr("class", "area")
                .attr("transform", "translate(" + padding + ",0)")
                .attr("d", area);
      }
    }

    function drawPath(svg, datapoints, padding, xScale, yScale) {
      var lineFunction = d3.svg.line()
                               .x(function(d, i) { return xScale(d[1]) + padding; })
                               .y(function(d, i) { return yScale(d[0]); })
                               .interpolate("linear");

      return svg.append("path")
                .attr("d", lineFunction(datapoints)) 
                .attr("stroke", "blue")
                .attr("stroke-width", 3)
                .attr("fill", "none");
                // .classed(lineData[i].target.replace('.','-').toLowerCase());
    }
    window.graphiteline = graphiteline;
})(window);