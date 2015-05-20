'use strict';
var happy = {
    //Public properties

    // jQuery objects
    $document : $(document),
    $window: $(window),
    $body : $('body'),
   
    // Sizes & Numbers
    scrollYPosition : 0,
    // Break Point Specific Numbers
    breakpointPixels : {
      sm: {
        upper: 767
      },
      md: {
        lower: 768,
        upper: 1269
      },
      lg: {
        lower: 1270
      } 
    },
    breakpoints : {
      sm : function() {
        if (matchMedia('only screen and (max-width: ' + happy.breakpointPixels.sm.upper + 'px)').matches) {
          return true;
        }
      },
      md : function() {
        if (matchMedia('only screen and (min-width: ' + happy.breakpointPixels.md.lower + 'px) and (max-width:' + happy.breakpointPixels.md.upper + 'px)').matches) {
          return true;
        }
      },
      lg : function() {
        if (matchMedia('only screen and (min-width: ' + happy.breakpointPixels.lg.lower + 'px)').matches) {
          return true;
        }
      },
      notlarge : function() {
        if (matchMedia('only screen and (max-width: ' + happy.breakpointPixels.md.upper + 'px)').matches) {
          return true;
        }
      },
    },
   
    //Public Methods **************************
    dash : function() {
      var dashData,
          coords;

      // Firebase
      // Get a reference to our posts
      var dash = new Firebase('https://happystat.firebaseio.com/');
      // Attach an asynchronous callback to read the data at our posts reference
      dash.on('value', function(snapshot) {
        //console.log(snapshot.val());
        dashData = snapshot.val();
        //console.log(dashData);
        coords = happy.sortData(dashData);
        console.dir(coords);

        happy.drawChart(coords);

      }, function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
      });
      
    },
    suggestion : function() {
      var suggestionDataRef = new Firebase('https://suggestionbox.firebaseio.com/');
      $('form').on('submit', function() {
        var sentiment = $('#sentiment').val(),
          cdid = $('#cdid').val(),
          referrer = $('#referrer').val();
        suggestionDataRef.push({sentiment: sentiment, cdid: cdid, referrer : referrer, timestamp : Firebase.ServerValue.TIMESTAMP });
        console.log('submitted suggestion');
      });
    },

    sentiment : function() {
      var sentimentDataRef = new Firebase('https://happystat.firebaseio.com/');
      $('form').on('submit', function() {
        var sentiment = $('#sentiment').val(),
          cdid = $('#cdid').val(),
          referrer = $('#referrer').val();
        sentimentDataRef.push({sentiment: sentiment, cdid: cdid, referrer : referrer, timestamp : Firebase.ServerValue.TIMESTAMP });
        console.log('submitted sentiment');
      });
    },
    drawChart : function(drawcoords) {

      var margin = {top: 20, right: 80, bottom: 30, left: 50},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      var parseDate = d3.time.format("%Y%m%d").parse;

      var x = d3.time.scale()
          .range([0, width]);

      var y = d3.scale.linear()
          .range([height, 0]);

      var color = d3.scale.category10();

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

      var line = d3.svg.line()
          .interpolate("basis")
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.temperature); });

      var svg = d3.select(".dash").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //d3.
      /* d3.json(dashData, function(error, data) {
        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

        data.forEach(function(d) {
          d.date = parseDate(d.date);
        });

        var cities = color.domain().map(function(name) {
          return {
            name: name,
            values: data.map(function(d) {
              return {date: d.date, temperature: +d[name]};
            })
          };
        });

        x.domain(d3.extent(data, function(d) { return d.date; }));

        y.domain([
          d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
          d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
        ]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Temperature (ºF)");

        var city = svg.selectAll(".city")
            .data(cities)
          .enter().append("g")
            .attr("class", "city");

        city.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return color(d.name); });

        city.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });
      }); */

    },

    sortData : function(storeData) {
      var chartCoords = {
          great : [],
          ok : [],
          notgreat : [],
          noparticipation : []
        };

      for (var submission in storeData) {

        var sentimentType = storeData[submission].sentiment,
            dateSubmitted = new Date(storeData[submission].timestamp);

        chartCoords[sentimentType].push(dateSubmitted);
        
      }
      return chartCoords;
    },
    highlightNav : function() {
      var currentUrl = window.location.href,
          lastSlash = currentUrl.lastIndexOf('/'),
          currentPage = currentUrl.substring(lastSlash+1),
          htmlextension;

      if (currentPage.indexOf(".html") > -1) {
        htmlextension = currentPage.indexOf(".html")
        currentPage = currentPage.substring(0,htmlextension)
      }

      if ((currentPage === 'index') || (!currentPage )) {
        currentPage = 'dash';
      }

      console.log(currentPage);

      $('nav a[data-href=' + currentPage + ']').addClass('current');
    },

    init : function() {

      happy.highlightNav();

      $('.nav-button').on('click', function() {
        $('.nav-inner').toggleClass('closed');
      });
      
      console.log('HappyStat front-end initialized.');


    } // End Init
};
$(function() {
  happy.init();
  if ($('.dash').length) {
    happy.dash();
  }
  if ($('.sentiment-form').length) {
    happy.sentiment();
  }
  if ($('.suggestion-form').length) {
    happy.suggestion();
  }
});

      
