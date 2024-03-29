/*These lines are all chart setup.  Pick and choose which chart features you want to utilize. */
nv.addGraph(function() {
  var chart = nv.models.lineChart()
                .margin({left: 50})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
                .forceY([1000,1900])
                .forceX([new Date(2013,1,1), new Date()])

  ;


  chart.xAxis     //Chart x-axis settings
      .tickFormat(function(d) { return d3.time.format("%b %Y")(new Date(d)); })
      .tickPadding(10);

  chart.yAxis     //Chart y-axis settings
      .tickFormat(d3.format("d"))
      .tickPadding(10);

  /* Done setting the chart up? Time to render it!*/
  var myData = getData();   //You need data...

  d3.select('#chart svg')    //Select the <svg> element you want to render the chart in.   
      .datum(myData)         //Populate the <svg> element with chart data...
      .call(chart);          //Finally, render the chart!

  //Update the chart when window resizes.
  nv.utils.windowResize(function() { chart.update() });
  return chart;
});