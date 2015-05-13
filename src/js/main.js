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
    someFunct : function() {
    
    },

    init : function() {
      
      
      console.log('Happy Stat front-end initialized.');
    } // End Init
};
happy.init();