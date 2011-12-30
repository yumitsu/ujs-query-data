/*  JavaScript helper for jQuery unobtrusive adapter.
 *
 *  
 *  It allows to pass :params parameter to options of link_to ActionView helper and send values as form data.
 *
 *  Example code: 
 *            <%= link_to 'Main page', root_path, :remote => true, :params => "ref=#{request.fullpath}", :method => "post"
 *        
 *  Renders to:
 *            <a href="/" data-remote="true" data-method="post" data-query-string="ref=/articles/1">Main page</a>  
 *        
 *  Clicking on resulting link will lead to AJAX POST with form data {ref: '/article/1'}. 
 *
 *  You can also use JSON-encoded hashes for multiple params.
 *  Example code:
 *            <%- data = {:ref => request.fullpath, :user_id => current_user.id} %>
 *            <%= link_to 'Main page', root_path, :remote => true, :params => data.to_json, :method => "post"
 *        
 *  Renders to:
 *            <a href="/" data-remote="true" data-method="post" data-query-string="ref=/articles/1">Main page</a> 
 *
 *  @version  0.0.1
 *  @author   Alexander 'yumitsu' Zinchenko
 *  @url      https://github.com/yumitsu/ujs-query-data
 */
// Set 'ujsSelectors' variable to your custom CSS selectors if presents;
var ujsSelectors;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
ujsSelectors = void 0;
/*  Init closure.
 *
 *  @description Overloads jQuery.rails with custom methods.
 *  @param object jQuery object.
 *  @param mixed Custom CSS selectors. If none provided, it will use link and input selectors from jQuery.rails.
 *  @return undefined
 */
(function($, cssSelectors) {
  var _ref;
  if ((_ref = $.rails) == null) {
    $.rails = new Hash;
  }
  if (cssSelectors === void 0) {
    cssSelectors = new Array;
  }
  /*  cssSelectors should be an Array or String with selectors separated by comma.  
   *
   *  Examples: 
   *    (function($, cssSelectors) {...})(jQuery, ".ujs-link, form.ujs-input");
   *    (function($, cssSelectors) {...})(jQuery, [".ujs-link", "form.ujs-input"]);
   */
  if (cssSelectors.length > 0) {
    if (typeof cssSelectors === 'string') {
      if (cssSelectors.indexOf(',') !== -1) {
        cssSelectors = $.map(cssSelectors.split(','), function(val) {
          return val.trim();
        });
      } else {
        cssSelectors = new Array(cssSelectors);
      }
    }
  }
  $.extend($.rails, {
    /*  jQuery.rails.handleDataToSend
     *
     *  @description Main method. Should be called on domReady.
     *  @example $.rails.handleDataToSend();
     *  @return jQuery
     */
    handleDataToSend: function() {
      var element, elements, groupItems, index, selector, selectorGroup, selectors, _i, _j, _len, _len2;
      selectors = cssSelectors.length !== 0 ? cssSelectors : [this.linkClickSelector, this.inputChangeSelector, this.requiredInputSelector];
      for (index in selectors) {
        selectorGroup = selectors[index];
        groupItems = $.map(selectorGroup.split(','), function(val) {
          return val.trim();
        });
        for (_i = 0, _len = groupItems.length; _i < _len; _i++) {
          selector = groupItems[_i];
          elements = $(selector);
          if ('size' in elements && elements.size() > 0 || elements.length > 0) {
            for (_j = 0, _len2 = elements.length; _j < _len2; _j++) {
              element = elements[_j];
              element = $(element);
              if (element.data('query-set') === void 0) {
                element.bind('ajax:before', __bind(function(e) {
                  return this.moveDataToStorage(e.currentTarget);
                }, this)).bind('ajax:beforeSend', __bind(function(e, xhr, settings) {
                  return this.modifyAjaxSettings(element, [xhr, settings]);
                }, this)).data('query-set', true);
              }
            }
          }
          null;
        }
        null;
      }
      return $;
    },
    /*  jQuery.rails.moveDataToStorage
     *
     *  @description Moves query data to internal storage explicitly.
     *  @example $.rails.moveDataToStorage('#ujs-link');
     *  @param mixed CSS selector or HTMLElement
     *  @return jQuery
     */
    moveDataToStorage: function(element) {
      var data, data_string, key, piece, value, _ref2, _ref3, _ref4;
      _ref2 = [$(element), ''], element = _ref2[0], data_string = _ref2[1];
      if (element.attr('params') !== void 0) {
        _ref3 = [element.attr('params'), element.removeAttr('params')], data = _ref3[0], element = _ref3[1];
        try {
          _ref4 = $.parseJSON(data);
          for (key in _ref4) {
            value = _ref4[key];
            piece = "" + key + "=" + value;
            data_string = data_string.length === 0 ? piece : "" + data_string + "&" + piece;
          }
        } catch (error) {
          data_string = data;
        }
        element.attr('data-query-string', data_string).data('params', data);
      }
      return element;
    },
    /*  jQuery.rails.modifyAjaxSettings
     *
     *  @description Provides ability to modify XHR settings and apply options to XHR object on ajax:beforeSend event.
     *  @example $('#ujs-link').data('ajax-settings-modify', function(xhr, settings) {...});
     *  @param mixed CSS selector or HTMLElement
     *  @param array Array with XHR and settings objects
     *  @return boolean
     */
    modifyAjaxSettings: function(element, data) {
      var callback, settings, status, xhr, _ref2;
      _ref2 = (function() {
        return [data[0], data[1], $(element)];
      })(), xhr = _ref2[0], settings = _ref2[1], element = _ref2[2];
      callback = element.data('ajax-settings-modify') !== void 0 && typeof (element.data('ajax-settings-modify')) === 'function' ? element.data('ajax-settings-modify') : function() {};
      try {
        status = callback.call(element, xhr, settings);
      } catch (error) {
        status = false;
      }
      return status;
    }
  });
  // Finally, initialize helper on domReady;
  return $(document).ready(function() {
    return $.rails.handleDataToSend();
  });
})(jQuery, ujsSelectors);