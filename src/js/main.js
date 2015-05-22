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
        dashData = snapshot.val();
        
        coords = happy.sortData(dashData);
    
        happy.drawN3(coords);


      }, function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
      });
      
    },
    drawN3 : function (data) {

      //console.dir(data);

      data.forEach(function(d) {
        d.values.forEach(function(g) {
          g.x = d3.time.format('%m-%d-%Y').parse(g.x);
        })
      });

      nv.addGraph(function() {
          var chart = nv.models.lineChart()
            .useInteractiveGuideline(true)
            .margin({left: 42}, {right: 42})
            ;

          chart.xAxis
              //.axisLabel("Dates")
              .tickFormat(function(d) {
                  return d3.time.format('%b %d')(new Date(d))
              });

          chart.xScale(d3.time.scale());

          chart.yAxis
              //.axisLabel("Responses")
              .tickValues([0, 0.2, 0.4, 0.6, 0.8, 1])
              .tickFormat(d3.format("%"))
              ;

          chart.yDomain([0,1]);

          d3.select("#chart svg")
              .datum(data)
              .transition().duration(500)
              .call(chart);

          nv.utils.windowResize(
                  function() {
                      chart.update();
                  }
              );

          return chart;
      });
    },

    sortData : function(storeData) {
      var chartCoords = {
          raw : {
            dates : {
              participants : {},
              everyone : {}
            },
            great : [],
            ok : [],
            notgreat : [],
            noparticipation : []
          },
          results : {
            great : {
              values: [],
              key: 'Great',
              color: '#00bff3'
            },
            ok : {
              values: [],
              key: 'OK',
              color: '#91278f'
            },
            notgreat : {
              values: [],
              key: 'Not Great',
              color: '#bc0c12'
            }
            /*,
            noparticipation : {
              values: [],
              key: 'No Participation',
              color: '#000000'
            } */
          }
        };

        var greatresult = {},
            okresult = {},
            notgreatresult = {},
            noresult = {},
            finalData = [],
            i = 0;

      // Loop through every submission
      for (var submission in storeData) {

        var sentimentType = storeData[submission].sentiment,
            dateSubmitted = new Date(storeData[submission].timestamp),
            dateFormattedSubmitted = moment(dateSubmitted).format("MM-DD-YYYY");
        
        // Find out how many entries per day, including non-participants on PW page.
        if (chartCoords.raw.dates.everyone[dateFormattedSubmitted]) {
          chartCoords.raw.dates.everyone[dateFormattedSubmitted] = chartCoords.raw.dates.everyone[dateFormattedSubmitted] + 1;
        } else {
          chartCoords.raw.dates.everyone[dateFormattedSubmitted] = 1;
        }

        // Find out how many entries per day, ignoring people who decided not to participate
        if ( storeData[submission].sentiment != "noparticipation") {
          
          if (chartCoords.raw.dates.participants[dateFormattedSubmitted] ) {
            chartCoords.raw.dates.participants[dateFormattedSubmitted] = chartCoords.raw.dates.participants[dateFormattedSubmitted] + 1;
          } else {
            chartCoords.raw.dates.participants[dateFormattedSubmitted] = 1;
          }

        }

        // Organize each submission by sentiment
        chartCoords.raw[sentimentType].push(dateFormattedSubmitted);
        
        // Keep track of total # of submissions
        i++;
      }

      console.log(i, chartCoords.raw);


      chartCoords.raw.great.forEach(function(x) { 
          greatresult[x] = (greatresult[x] || 0) + 1; 
        });
      chartCoords.raw.ok.forEach(function(x) { 
          okresult[x] = (okresult[x] || 0) + 1; 
        });
      chartCoords.raw.notgreat.forEach(function(x) { 
        notgreatresult[x] = (notgreatresult[x] || 0) + 1; 
      });
      /*
      chartCoords.raw.noparticipation.forEach(function(x) { 
        noresult[x] = (noresult[x] || 0)+1; 
      });
      */

      var toPercentage = function(emotionvotes, date) {
        var percent = emotionvotes / chartCoords.raw.dates.participants[date];
        return percent;
      };

      var greatarray = $.map(greatresult, function(value, index) {
          return {'x': index, 'y': toPercentage(value, index) };
      });
      var okarray = $.map(okresult, function(value, index) {
          return {'x': index, 'y': toPercentage(value, index)};
      });
       var notgreatarray = $.map(notgreatresult, function(value, index) {
          return {'x': index, 'y': toPercentage(value, index)};
      });
      /*
      var noarray = $.map(noresult, function(value, index) {
          return {'x': index, 'y': value};
      });
      */
    

      chartCoords.results.great.values = greatarray;
      
      chartCoords.results.ok.values = okarray;
      chartCoords.results.notgreat.values = notgreatarray;
      
      // chartCoords.results.noparticipation.values = noarray;
      //finalData.push(chartCoords.results.great);

      for (var data in chartCoords.results ) {

        finalData.push(chartCoords.results[data]);
        
      }

      console.log(finalData);

      return finalData;
    },
    suggestion : function() {
      var suggestionDataRef = new Firebase('https://suggestionbox.firebaseio.com/'),
          gotIt = 'Got it!';

      $('form').on('submit', function(e) {
        e.preventDefault();
        var suggestion = $('#suggestiontext').val(),
          cdid = $('#cdid').val(),
          referrer = $('#referrer').val(),
          shoutout = $('#shoutout').is(':checked'),
          workflow = $('#workflow').is(':checked'),
          problem = $('#problem').is(':checked'),
          newidea =  $('#newidea').is(':checked');

        suggestionDataRef.push({suggestion: suggestion, cdid: cdid, referrer : referrer, shoutout: shoutout, workflow: workflow, problem: problem, newidea: newidea, timestamp : Firebase.ServerValue.TIMESTAMP });
        console.log('submitted suggestion');

        $('.suggestion-submit').attr('disabled', 'disabled').addClass('success').find('.button-text').text(gotIt);

      });

      $('#suggestiontext').one('keyup change paste', function(e) {
        $('.suggestion-submit').removeAttr('disabled');
      });
    },

    sentiment : function() {
      var sentimentDataRef = new Firebase('https://happystat.firebaseio.com/'),
          successMessage = 'Thanks! Your response has been recorded!',
          gotIt = 'Got it!';


      $('form').on('submit', function(e) {
        e.preventDefault();
        var sentiment = $('input[name=mood]:checked').val(),
          cdid = $('#cdid').val(),
          question = $('.hs-question').text(),
          referrer = $('#referrer').val();
        sentimentDataRef.push({sentiment: sentiment, cdid: cdid, question : question, referrer : referrer, timestamp : Firebase.ServerValue.TIMESTAMP });
        console.log('submitted sentiment');
        $('.hs-question').text(successMessage);
        $('.sentiment-submit').attr('disabled', 'disabled').addClass('success').find('.button-text').text(gotIt);

      });

      $('.hs-answer').one('click', function() {
          $('.sentiment-submit').removeAttr('disabled');
      });
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

      
