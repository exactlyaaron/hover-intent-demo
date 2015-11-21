;(function($) {

  $.ioAccordion = function(el, options) {

    var defaults = {
      activeBreakpoints: [], // empty array means always active
      status: 'closed',
      singleItemOpen: false,
      duration: 200,
      easing: 'swing',
      open: $.noop,
      opened: $.noop,
      close: $.noop,
      closed: $.noop,
      parentClass: null
    };

    // Create CUSTOM TOGGLE event.
    var openingEvent = document.createEvent('Event');
    var openedEvent = document.createEvent('Event');
    var closingEvent = document.createEvent('Event');
    var closedEvent = document.createEvent('Event');

    // Define that the event name is 'ioAccordion-opened'.
    openingEvent.initEvent('ioAccordion-opening', true, true);
    openedEvent.initEvent('ioAccordion-opened', true, true);
    closingEvent.initEvent('ioAccordion-closing', true, true);
    closedEvent.initEvent('ioAccordion-closed', true, true);

    var cssClasses = {
        ITEM: 'io-accordion__item',
        HEADER: 'io-accordion__item__header',
        OPENED: 'io-accordion__item--is-open',
        OPENING: 'io-accordion__item--is-opening',
        CLOSING: 'io-accordion__item--is-closing',
        DISABLED: 'io-accordion__item--is-disabled'
    };

    var selectors = {
      ITEM_HEADER: '> .io-accordion__item > .io-accordion__item__header',
      ITEM_CONTENT_WRAPPER: '> .io-accordion__content-wrapper',
      ITEM_CONTENT: '> .io-accordion__item > .io-accordion__item__content'
    };

    var plugin = this;

    plugin.settings = {};

    var init = function() {
      plugin.settings = $.extend({}, defaults, options);
      plugin.el = el;
      plugin.$ioAccordion = $(el);

      // code goes here
      plugin._wrapContent(plugin.$ioAccordion);
      plugin._bindEvents();

      if(plugin.settings.status === 'closed' && plugin._isActiveBreakpoint()){
        plugin.closeAll(true);
      }
    };

    plugin._isActiveBreakpoint = function(){
      if( plugin.settings.activeBreakpoints.length > 0 ){
        for(var i = 0; i < plugin.settings.activeBreakpoints.length; i++ ){
          var breakpoint = plugin.settings.activeBreakpoints[i];
          if( $('html').hasClass(breakpoint) ) {
            return true;
          }
        }
        return false;
      } else {
        return true;
      }
    };

    plugin._wrapContent = function($items){
      $items
        .find(selectors.ITEM_CONTENT)
        // wrap content section of each item to facilitate padding
        .wrap('<div class="io-accordion__content-wrapper" />')
        // add aria-hidden attribute to all hidden content wrappers
        .parents('.io-accordion__item:not(.io-accordion--is-open)')
        .find(selectors.ITEM_CONTENT_WRAPPER)
        .attr('aria-hidden', true);
    };

    plugin._bindEvents = function() {
      $('.io-accordion')
        .on('click', function(e) {
          var $target = $(e.target);
          var $closestAccordion = $target.closest('.io-accordion');

          // We don't want to continue if we're clicking on an anchor
          if ($target.is('a') || !!$target.parents('a').length) {
            return;
          }

          // cancel click if active breakpoint is not present
          if(!plugin._isActiveBreakpoint()){
            return;
          }

          // We need to verify not only that we're inside the direct bellows of the item, but also if the item is a header/child of a header
          if ($closestAccordion[0] === plugin.$ioAccordion[0] && ($target.hasClass(cssClasses.HEADER) || !!$target.closest('.io-accordion__item__header').length)) {
            e.preventDefault();
            e.stopPropagation();
            plugin.toggle($target.closest('.io-accordion__item'));
          }
        });
    };

    plugin._isOpen = function($item) {
        return $item.hasClass(cssClasses.OPENED);
    };

    plugin._isDisabled = function($item) {
        return $item.hasClass(cssClasses.DISABLED);
    };

    plugin.toggle = function($item) {

      if( $item.hasClass(cssClasses.OPENED) ){
        plugin.close($item);
      } else {
        plugin.open($item);
      }
    };

    plugin.open = function($item) {

      if (this._isOpen($item) || this._isDisabled($item)) {
        return;
      }

      var $content = $item.find(selectors.ITEM_CONTENT_WRAPPER);

      if (plugin.settings.singleItemOpen) {
        this.closeAll();
      }

      $content.velocity('slideDown', {
        begin: function(){
          $item.addClass(cssClasses.OPENING);
          document.dispatchEvent(openingEvent);
        },
        duration: plugin.settings.duration,
        easing: plugin.settings.easing,
        complete: function() {
          // FIRE CUSTOM EVENT
          document.dispatchEvent(openedEvent);
          $item
            .removeClass(cssClasses.OPENING)
            .addClass(cssClasses.OPENED)
            .find(selectors.ITEM_CONTENT_WRAPPER)
            .attr('aria-hidden', false);
        }
      });
    };

    plugin.close = function($item, custom) {

      if(!custom){
        if (!this._isOpen($item) || this._isDisabled($item)) {
          return;
        }
      }

      var $content = $item.find(selectors.ITEM_CONTENT_WRAPPER);

      $content.velocity('slideUp', {
        begin: function(){
          $item
            .removeClass(cssClasses.OPENED)
            .addClass(cssClasses.CLOSING);
            document.dispatchEvent(closingEvent);
        },
        duration: plugin.settings.duration,
        easing: plugin.settings.easing,
        complete: function() {
          $item
            .removeClass(cssClasses.CLOSING)
            .find(selectors.ITEM_CONTENT_WRAPPER)
            .attr('aria-hidden', true);
            document.dispatchEvent(closedEvent);
        }
      });
    };

    plugin.toggleAll = function() {
    plugin.$ioAccordion.find('.' + cssClasses.ITEM).each(function() {
          plugin.toggle($(this));
      });
    };

    plugin.openAll = function() {
      plugin.$ioAccordion.find('.' + cssClasses.ITEM + ':not(.' + cssClasses.OPENED + ')').each(function() {
          plugin.open($(this));
      });
    };

    plugin.closeAll = function(custom) {
      plugin.$ioAccordion.find('.' + cssClasses.ITEM).each(function() {
          if(custom){
            plugin.close($(this), true);
          } else {
            plugin.close($(this));
          }
      });
    };

    init();

  };

})(jQuery);
