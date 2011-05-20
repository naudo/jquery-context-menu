/*
* jQuery.contextMenu
*
* @author Nicholas Audo
* @url http://github.com/naudo/jquery-context-menu
* 
* Original Author: Chris Domigan
* Past Contributors: Dan G. Switzer, II
* Parts of this plugin are inspired by Joern Zaefferer's Tooltip plugin
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
* Version: 0.1.0
* Date: August 9, 2010
*
* For the original jquery plugin / documentation visit http://www.trendskitchens.co.nz/jquery/contextmenu/
*
*/

(function($) {

  var menu, shadow, trigger, content, hash, currentTarget;
  var defaults = {
    menuStyle: {
      listStyle: 'none',
      padding: '1px',
      margin: '0px',
      backgroundColor: '#fff',
      border: '1px solid #999',
      width: '220px'
    },
    itemStyle: {
      margin: '0px',
      color: '#000',
      display: 'block',
      cursor: 'default',
      padding: '3px',
      border: '1px solid #fff',
      backgroundColor: 'transparent'
    },
    itemHoverStyle: {
      border: '1px solid #0a246a',
      backgroundColor: '#b6bdd2'
    },
    eventPosX: 'pageX',
    eventPosY: 'pageY',
    shadow : true,
    onContextMenu: null,
    onShowMenu: null
  };

  $.fn.contextMenu = function(id, options) {
    //console.log('in menu') // call sthis every right-click, strange.
    if (!menu) {                                      // Create singleton menu
      menu = $('<div id="jqContextMenu"></div>')
      .hide()
      .css({position:'absolute', zIndex:'500'})
      .appendTo('body')
      .live('click', function(e) {
        e.stopPropagation();
      });
    }
    if (!shadow) {
      shadow = $('<div id="jqShadow"></div>')
      .css({backgroundColor:'#000',position:'absolute',opacity:0.2,zIndex:499})
      .appendTo('body')
      .hide();
    }
    hash = hash || [];
    hash.push({
      id : id,
      menuStyle: $.extend({}, defaults.menuStyle, options.menuStyle || {}),
      itemStyle: $.extend({}, defaults.itemStyle, options.itemStyle || {}),
      itemHoverStyle: $.extend({}, defaults.itemHoverStyle, options.itemHoverStyle || {}),
      bindings: options.bindings || {},
      shadow: options.shadow || options.shadow === false ? options.shadow : defaults.shadow,
      onContextMenu: options.onContextMenu || defaults.onContextMenu,
      onShowMenu: options.onShowMenu || defaults.onShowMenu,
      eventPosX: options.eventPosX || defaults.eventPosX,
      eventPosY: options.eventPosY || defaults.eventPosY
    });

    var index = hash.length - 1;
    // strange, it doesn't call the function if the object is at the top of the screen.
    // didn't work with live instead of bind?
    $(this).live('contextmenu', function(e) {
      //console.log('base menu called')
      // Check if onContextMenu() defined
      var bShowContext = (!!hash[index].onContextMenu) ? hash[index].onContextMenu(e) : true;
      if (bShowContext) display(index, this, e, options);
      return false;
    });
    return this;
  };

  function display(index, trigger, e, options) {
    //console.log("display")
    var cur = hash[index];
    content = $('#'+cur.id).find('ul:first').clone(true);
    content.css(cur.menuStyle).find('li').css(cur.itemStyle).hover(
      function() {
        $(this).css(cur.itemHoverStyle);
      },
      function(){
        $(this).css(cur.itemStyle);
      }
      ).find('img').css({verticalAlign:'middle',paddingRight:'2px'});

      // Send the content to the menu
      menu.html(content);

      // if there's an onShowMenu, run it now -- must run after content has been added
      // if you try to alter the content variable before the menu.html(), IE6 has issues
      // updating the content
      if (!!cur.onShowMenu) menu = cur.onShowMenu(e, menu);

      $.each(cur.bindings, function(id, func) {
        $('#'+id, menu).bind('click', function(e) {
          //console.log("clicked ", trigger, currentTarget)
          hide();
          func(trigger, currentTarget);
        });
      });

      menu.css({'left':e[cur.eventPosX],'top':e[cur.eventPosY]}).show();
      
      // this is breaking FF
      if (cur.shadow) shadow.css({width:menu.width(),height:menu.height(),left:e.pageX+2,top:e.pageY+2}).show();
      
      // binding tod ocument to hide the element, but only do it once.  == jquery.one() seems nonstandard?
      // pehraps it's firing as a part of the current click?  yup, seems to be the problem
      // $(document).one('click', hide);
      setTimeout("$(document).one('click', function() {$('#jqContextMenu,#jqShadow').hide()})",1)
    }

    function hide() {
      menu.hide();
      shadow.hide();
    }

    // Apply defaults
    $.contextMenu = {
      defaults : function(userDefaults) {
        $.each(userDefaults, function(i, val) {
          if (typeof val == 'object' && defaults[i]) {
            $.extend(defaults[i], val);
          }
          else defaults[i] = val;
        });
      }
    };

    })(jQuery);