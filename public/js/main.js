var navContainer;

$(document).ready(function(){
  //$(".ng-global-nav__topbar").headroom({tolerance : 10});

  function GlobalNavigation(){

    var isMobileDevice = false;
    if($('html').hasClass('breakpoint-palm-only')){
      isMobileDevice = true;
    }

    var isTouchDevice = Modernizr.touch;
    var tapEvent = isTouchDevice ? 'touchstart' : 'click';

    var $overlayWrapper = $('.ng-global-nav__dropdowns-wrapper'),
        $dropdownsWrapper = $('.ng-global-nav__dropdowns-content'),
        $collectionsWrapper = $('.ng-global-nav__promo-collections-content'),
        $dropdownElements = $('.ng-global-nav__dropdown'),
        $navPromoCollectionElements = $('.global-nav__promo-collection__wrapper'),
        $dropdownClose = $('.ng-global-nav__close');

    function disableBodyScrolling(){
      $('html, body').css('overflow', 'hidden');

      // Uses document because document will be topmost level in bubbling
      $(document).on('touchmove',function(e){
        e.preventDefault();
      });

      // Prevents preventDefault from being called on document if it sees a scrollable div
      $('body').on('touchmove','.scrollable',function(e) {
        e.stopPropagation();
      });
    }

    function enableBodyScrolling(){
      $('html, body').css('overflow', 'auto');
      $(document).unbind('touchmove');
    }

    // object to manage states
    this.menuManager = {
      activeElement: null,
      activeWrapper: null,
      visible: false,
      animating: false,
      wrapper: $overlayWrapper,
      hoverTarget: null
    };

    // set menuManager in another variable to get it out of 'this' restrictions
    var manager = this.menuManager,
        navTimer = null,
        navTimerManager = null;

    // set global object on external variable for other files to access it
    navContainer = this;

    function killTimer(){
      clearTimeout(navTimer);
      navTimer = null;
      navTimerManager = null;
    }

    this.openMenu = function($contentWrapper, $element){
      killTimer();
      disableBodyScrolling();
      manager.animating = true;

      if(manager.activeWrapper){
        // if menu is open with wrong content wrapper, close it
        if( manager.activeWrapper[0] !== $contentWrapper[0] ){
          this.closeDropdown(manager.activeElement);
          setTimeout(function(){
            $contentWrapper.removeClass('dropdown__closed');
            $dropdownClose.css('display', 'block').removeClass('opacity-0');
            // wait for animation time
            setTimeout(function(){
              manager.animating = false;
            }, 200);
          }, 200);
        }
      } else {
        // velocity fade in new wrapper
        manager.wrapper.css('display', 'block').removeClass('opacity-0');
        setTimeout(function(){
          $contentWrapper.removeClass('dropdown__closed');
          $dropdownClose.css('display', 'block').removeClass('opacity-0');
          // wait for animation time
          setTimeout(function(){
            manager.animating = false;
          }, 200);
        }, 250);
      }

      manager.visible = true;
      manager.activeWrapper = $contentWrapper;
    };

    this.closeMenu = function(){
      killTimer();
      enableBodyScrolling();
      manager.animating = true;
      $('.collection-link, .dropdown-link').removeClass('inactive-link active-link');
      $('.collection-link').css('background-color', 'transparent').css('background-color', '');

      function closeMenuStates(){
        navContainer.closeDropdown(manager.activeElement);
        manager.activeWrapper.addClass('dropdown__closed');

        // wait close dropdown for animation
        setTimeout(function(){
          manager.wrapper.addClass('opacity-0');
          setTimeout(function(){
            manager.wrapper.css('display', 'none');
            manager.visible = false;
            manager.activeWrapper = null;
            manager.animating = false;
          }, 100);
        },200);
      }

      if( manager.activeWrapper[0] === $dropdownsWrapper[0] ){
        // if closing the dropdown wrapper (not collection wrapper) fade out the close button also
        $dropdownClose.addClass('opacity-0');
        setTimeout(function(){
          $dropdownClose.css('display', 'none');
          closeMenuStates();
        }, 100);
      } else {
        closeMenuStates();
      }
    };

    this.openDropdown = function($wrapper, $element, e){
      killTimer();

      if( !manager.activeElement ){
        this.openMenu($wrapper);
        manager.activeElement = $element;
        setTimeout(function(){
          $element.show();
          setTimeout(function(){
            $element.removeClass('dropdown-content__hidden');
          }, 50);
        }, 50);

      } else {
        //check the existing wrapper, open new one if needed
        if( manager.activeWrapper !== $wrapper ){
          this.openMenu($wrapper);
        }

        if( manager.activeElement ){
          this.closeDropdown(manager.activeElement);
        }

        manager.activeElement = $element;
        setTimeout(function(){
          $element.show();
          // set delay to wait on closing animation
          setTimeout(function(){
            $element.removeClass('dropdown-content__hidden');
          }, 10);
        }, 200);
      }

      // add active-link class to the proper topbar link
      var dropdownId = $element.data('dropdown');
      var $link = $('.ng-global-nav__topbar-link[data-dropdown-id="'+dropdownId+'"]');
      if($link.length){
        $('.active-link').removeClass('active-link');
        $link.addClass('active-link');
      }

      // if type is dropdown, disable the promo collection links (not on touch devices)
      var type = $element.data('type');
      if(!isTouchDevice){
        if(type === 'dropdown'){
          $('.collection-link').addClass('inactive-link');
        }
      }

      // if user opened the search dropdown, add focus to the input
      if( dropdownId === 'search' ){
        setTimeout(function(){
          $("#global-nav__search-input").focus();
        }, 400);
      }

      // if( type === 'promo-collection' ){
      //   sendGaEvent(e.type, e.target, 'expand');
      // }
    };

    this.closeDropdown = function($element){
      killTimer();
      $element.addClass('dropdown-content__hidden');
      setTimeout(function(){
        $element.hide();
      }, 200);
      manager.activeElement = null;
    };

    function clickEventNavClose(e){
      e.preventDefault();
      e.stopPropagation();
      //sendGaEvent(e.type, e.target, 'close');
      navContainer.closeMenu();
    }

    function clickEventDropdownWrapper(e){
      // dont change behavior if target is input
      if($(e.target).is('input')){
        return;
      }

      //weird touch bug add active-link class back to button
      if(isTouchDevice){
        $('.dropdown-link[data-dropdown-id="'+manager.activeElement.data('dropdown')+'"]').addClass('active-link');
      }

      if(!isMobileDevice){
        // if target is not an anchor tag, override the default behavior
        if(!$(e.target).is('a') && !$(e.target).parents('a').length > 0){
          e.preventDefault();
          // close menu if clicking in overlay area
          if( manager.visible === true ){
            if( $(e.target)[0] === $overlayWrapper[0] ){
              navContainer.closeMenu();
            } else {
              return;
            }
          }
        }
      }
    }

    function clickEventCollectionLink(e){
      e.preventDefault();
      if(!isTouchDevice){
        //window.location.assign($(e.target).closest('a').attr('href'));
        if(manager.visible === true && manager.activeWrapper[0] === $dropdownsWrapper[0]){
          navContainer.closeMenu();
        }
      }
    }

    function clickEventDropdownLink(e){
      e.preventDefault();
      var gaEventSent = null;
      var gaDropdownId = $(e.target).data('dropdown-id');

      var $element = $('.ng-global-nav__dropdown[data-dropdown="'+$(e.target).data('dropdown-id')+'"]');

      $('.active-link').removeClass('active-link');
      $(e.target).addClass('active-link');

      // if menu is already open, figure out what to do
      if( manager.activeElement ){

        var activeId = manager.activeElement.data('dropdown'),
            clickId = $(e.target).data('dropdown-id'),
            activeType =  manager.activeElement.data('type'),
            clickType;

        if( $(e.target).hasClass('dropdown-link') ){
          clickType = 'dropdown';
        } else if ( $(e.target).hasClass('collection-link') ){
          clickType = 'promo-collection';
        }

        if( activeId === clickId ) {
          // you clicked the link of the current open menu item
          navContainer.closeMenu();
          //sendGaEvent('close', e.target, gaDropdownId);
          gaEventSent = true;
        } else {
          // if you clicked a different dropdown link
          if( activeType !== clickType && activeType === 'dropdown') {
            navContainer.closeMenu();
            //sendGaEvent('close', e.target, gaDropdownId);
            gaEventSent = true;
          } else {
            var $newElement = $('.ng-global-nav__dropdown[data-dropdown="'+clickId+'"]');
            navContainer.openDropdown($dropdownsWrapper, $newElement, e);
          }
        }

      } else {
        // menu not already open
        navContainer.openDropdown($dropdownsWrapper, $element, e);
      }

      // if(!gaEventSent){
      //   sendGaEvent('expand', e.target, gaDropdownId);
      // }
    }

    function bindClickEvents(){
      // setup click event listeners
      var navCloseButtons = document.getElementsByClassName('ng-global-nav__close');
      var dropdownWrappers = document.getElementsByClassName('ng-global-nav__dropdowns-wrapper');
      var collectionLinks = document.getElementsByClassName('collection-link');
      var dropdownLinks = document.getElementsByClassName('dropdown-link');

      _.forEach(navCloseButtons, function(el){
        el.addEventListener(tapEvent, function(e){
          clickEventNavClose(e);
        }, false);
      });

      _.forEach(dropdownWrappers, function(el){
        el.addEventListener(tapEvent, function(e){
          clickEventDropdownWrapper(e);
        }, false);
      });

      _.forEach(collectionLinks, function(el){
        el.addEventListener(tapEvent, function(e){
          clickEventCollectionLink(e);
        }, false);
      });

      _.forEach(dropdownLinks, function(el){
        el.addEventListener(tapEvent, function(e){
          clickEventDropdownLink(e);
        }, false);
      });
    }

    function bindHoverEvents(){

      function killCollectionTimerCheck($element, action){
        if( navTimerManager.selector[0] === $element[0] && navTimerManager.action === action){
          killTimer();
        }
      }

      function buildNavTimer($element, action, e){
        if( action === 'openMenu' ){
          navTimer = setTimeout(function(){
            navContainer.openDropdown($collectionsWrapper, $element, e);
          }, 350);
        } else if( action === 'closeMenu' ) {
          navTimer = setTimeout(function(){
            //navContainer.openDropdown($collectionsWrapper, $element, e);
            navContainer.closeMenu();
          }, 350);
        }
        navTimerManager = {
          timerID: navTimer,
          action: action,
          selector: $element
        };
      }

      function linkMouseEnterEvents($el, e){
        killTimer();
        if( manager.activeWrapper !== $dropdownsWrapper ){
          manager.hoverTarget = $('.ng-global-nav__dropdown[data-dropdown="'+$el.data('dropdown-id')+'"]');

          if(navTimer){
            // if current timer is not going to open the target element, cancel it
            if( navTimerManager.selector[0] !== manager.hoverTarget[0] && navTimerManager.action === 'openMenu'){
              killTimer();
            } else if ( navTimerManager.selector[0] === manager.hoverTarget[0] ){
              // if current timer is going to close target element, cancel it
              killTimer();
            }
          }

          // if target element is not already open, schedule it to be opened
          if( !manager.activeElement ){
            buildNavTimer(manager.hoverTarget, 'openMenu', e);
          } else {
            if( manager.activeElement[0] !== manager.hoverTarget[0] ){
              buildNavTimer(manager.hoverTarget, 'openMenu', e);
            }
          }
        }
      }

      function linkMouseLeaveEvents($el, e){
        killTimer();
        if( manager.activeWrapper !== $dropdownsWrapper ){
          manager.hoverTarget = $('.ng-global-nav__dropdown[data-dropdown="'+$el.data('dropdown-id')+'"]');

          // if current timer is not closing target element, cancel it
          if(navTimer){
            killCollectionTimerCheck(manager.hoverTarget, 'closeMenu');
          }

          // if target element is open, schedule it to be closed
          if( manager.activeElement ){
            if( manager.activeElement[0] === manager.hoverTarget[0] ){
              // condition for short time before menu is show, in case of quick mouseleave
              if(!manager.animating){
                buildNavTimer(manager.hoverTarget, 'closeMenu', e);
              }
            }
          }
        }
      }

      function collectionMouseEnterEvents($el, e){
        manager.hoverTarget = $el;
        if( manager.activeWrapper !== $dropdownsWrapper ){
          // if timer will close current collection, cancel it
          if(navTimer){
            killCollectionTimerCheck(manager.hoverTarget, 'closeMenu');
          }
        }
      }

      function collectionMouseLeaveEvents($el, e){
        manager.hoverTarget = $el;
        // schedule timer to close collection, this will get cancelled it entering correct link
        if( manager.activeWrapper !== $dropdownsWrapper ){
          buildNavTimer(manager.hoverTarget, 'closeMenu', e);
        }
      }

      // setup mouseenter mouseleave functions
      if(isTouchDevice){
        $(document).on('touchstart', '.collection-link', function(e){
          if(manager.activeWrapper){
            if(manager.activeWrapper[0] !== $dropdownsWrapper[0]){
              if($(this).hasClass('active-link')){
                $('.active-link').removeClass('active-link');
                navContainer.closeMenu();
              }
            }
          }
          var $targetElement = $('.ng-global-nav__dropdown[data-dropdown="'+$(this).data('dropdown-id')+'"]');
          navContainer.openDropdown($collectionsWrapper, $targetElement, e);
        });
      } else {
        $('.collection-link').mouseenter(function(e){
          linkMouseEnterEvents($(this), e);
        }).mouseleave(function(e){
          linkMouseLeaveEvents($(this), e);
        });

        $('.ng-global-nav__dropdown').mouseenter(function(e){
          collectionMouseEnterEvents($(this), e);
        }).mouseleave(function(e){
          collectionMouseLeaveEvents($(this), e);
        });
      }
    }

    bindClickEvents();
    bindHoverEvents();
  }
  var globalNav = new GlobalNavigation();
});
