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

      //console.log(data);

      nv.addGraph(function() {
        var chart = nv.models.cumulativeLineChart()
          .x(function(d) { 
            //console.log(d); 
            return d[0] 
          })
          .y(function(d) { 
            return d[1] 
          })
          .color(d3.scale.category10().range())
          .useInteractiveGuideline(true)
          ;

        chart.xAxis
          .tickFormat(function(d) {
            return d3.time.format('%x')(new Date(d))
          });

        chart.yAxis.tickFormat(d3.format(',d'));

        d3.select('#chart svg')
          .datum(data)
          //.transition().duration(500)
          .call(chart)
          ;

        nv.utils.windowResize(chart.update);

        return chart;
      });
    },

    sortData : function(storeData) {
      var chartCoords = {
          raw : {
            great : [],
            ok : [],
            notgreat : [],
            noparticipation : []
          },
          results : {
            great : {
              values: [],
              key: 'Great',
              color: '#00ff00'
            },
            ok : {
              values: [],
              key: 'OK',
              color: '#0000ff'
            },
            notgreat : {
              values: [],
              key: 'Not Great',
              color: '#ff0000'
            },
            noparticipation : {
              values: [],
              key: 'No Participation',
              color: '#000000'
            }
          }
        };

        var greatresult = {},
            okresult = {},
            notgreatresult = {},
            noresult = {},
            finalData = [];

      for (var submission in storeData) {

        var sentimentType = storeData[submission].sentiment,
            dateSubmitted = new Date(storeData[submission].timestamp),
            dateFormattedSubmitted = moment(dateSubmitted).format("MM-DD-YYYY");
            console.log(typeof dateFormattedSubmitted);
        
        chartCoords.raw[sentimentType].push(dateFormattedSubmitted);
        
      }

      chartCoords.raw.great.forEach(function(x) { 
          greatresult[x] = (greatresult[x] || 0)+1; 
        });
      chartCoords.raw.ok.forEach(function(x) { 
          okresult[x] = (okresult[x] || 0)+1; 
        });
      chartCoords.raw.notgreat.forEach(function(x) { 
        notgreatresult[x] = (notgreatresult[x] || 0)+1; 
      });
      chartCoords.raw.noparticipation.forEach(function(x) { 
        noresult[x] = (noresult[x] || 0)+1; 
      });

      console.log(greatresult);

      var greatarray = $.map(greatresult, function(value, index) {
          return [[index,value]];
      });

      console.log(greatarray);

      chartCoords.results.great.values.push(greatarray);

      console.log(chartCoords.results.great.values);

      finalData.push(chartCoords.results.great);
      //chartCoords.results.ok.values.push(okresult);
      //chartCoords.results.notgreat.values.push(notgreatresult);
      //chartCoords.results.noparticipation.values.push(noresult);

      /* for (var data in chartCoords.results ) {

        finalData.push(chartCoords.results[data]);
        
      } */

      //console.log(finalData);

      return finalData;
    },
    suggestion : function() {
      var suggestionDataRef = new Firebase('https://suggestionbox.firebaseio.com/'),
          gotIt = 'Thanks!';

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

        $('.suggestion-submit').attr('disabled', 'disabled').addClass('success').text(gotIt);

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
          referrer = $('#referrer').val();
        sentimentDataRef.push({sentiment: sentiment, cdid: cdid, referrer : referrer, timestamp : Firebase.ServerValue.TIMESTAMP });
        console.log('submitted sentiment');
        $('.hs-question').text(successMessage);
        $('.sentiment-submit').attr('disabled', 'disabled').addClass('success').text(gotIt);

      });

      $('.hs-answer').on('click', function() {
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

      
