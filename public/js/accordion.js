  var windowWidth = $(window).width();

  // INSTANTIATE ACCORDION
  var globalNavAccordion = new $.ioAccordion($('.global-nav__explore-content.io-accordion'),{ activeBreakpoints:['breakpoint-palm-only'] });

  //if user resizes from tablet to mobile this function fixes the things that invisible accordion sections cant handle
  //namely correcting opacity and setting sizes for responsive slider
  var isMobileOnLoad = false;
  if($('html').hasClass('breakpoint-palm-only')){
    isMobileOnLoad = true;
  }

  $('.global-nav__explore__main-menu__link.io-accordion__item__header').on('click', function(e){
    if($('html').hasClass('breakpoint-palm-only')){
      var $element = $(this).find('.global-nav__accordion-status');
      toggleAccordionStatus($element, e);
    }
  });

  function toggleAccordionStatus($element, e){
    var toggleState = $element.attr('data-state');
    var label = $(e.target).text().trim();
    if(toggleState === 'closed'){
      sendGaEvent('expand', e.target, label);
      $element.css('transform', 'rotate(-90deg)');
      $element.attr('data-state', 'open');
    } else {
      $element.css('transform', 'rotate(90deg)');
      $element.attr('data-state', 'closed');
      sendGaEvent('collapse', e.target, label);
    }
  }

  var globalNavResizeFunction = _.debounce(function() {
    //console.log('resize function fire');
    // All the taxing stuff i do
    if(!isMobileOnLoad){
      metaQuery.onBreakpointChange( 'palm-only', function ( match ) {
        if( match ) {
          // phawor! media query matches.
          globalNavAccordion.closeAll(true);
          navContainer.closeMenu();
        }
      });
    }

    // metaQuery.onBreakpointChange( 'tablet-up', function ( match ) {
    //   if( match ) {
    //     //console.log('DIS BE AT LEAST TABLET SIZE');
    //   }
    // });
  }, 500);

  setTimeout(function(){
    window.addEventListener('resize', globalNavResizeFunction);
  }, 1000);
