###  JavaScript helper for jQuery unobtrusive adapter.
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
 *  @version  0.0.2
 *  @license  MIT license <http://opensource.org/licenses/mit-license.php>
 *  @author   Alexander 'yumitsu' Zinchenko
 *  @url      https://github.com/yumitsu/ujs-query-data
 ###


`// Set 'ujsSelectors' variable to your custom CSS selectors if presents`
ujsSelectors = undefined

###  Init closure.
 *
 *  @description Overloads jQuery.rails with custom methods.
 *  @param object jQuery object.
 *  @param mixed Custom CSS selectors. If none provided, it will use link and input selectors from jQuery.rails.
 *  @return undefined
 ###
(($, cssSelectors) ->
  $.rails      ?= new Hash
  cssSelectors  = new Array if cssSelectors is undefined

  ###  cssSelectors should be an Array or String with selectors separated by comma.  
 *
 *  Examples: 
 *    (function($, cssSelectors) {...})(jQuery, ".ujs-link, form.ujs-input");
 *    (function($, cssSelectors) {...})(jQuery, [".ujs-link", "form.ujs-input"]);
 ###
  if cssSelectors.length > 0
    if typeof(cssSelectors) is 'string'
      if cssSelectors.indexOf(',') isnt -1
        cssSelectors = $.map cssSelectors.split(','), (val) ->
          val.trim()
      else
        cssSelectors = new Array(cssSelectors)

  $.extend $.rails,
    ###  jQuery.rails.handleDataToSend
 *
 *  @description Main method. Should be called on domReady.
 *  @example $.rails.handleDataToSend();
 *  @return jQuery
 ###
    handleDataToSend: () ->
      selectors = if cssSelectors.length isnt 0 \
                  then cssSelectors \
                  else [@linkClickSelector, @inputChangeSelector, @requiredInputSelector]

      for index, selectorGroup of selectors
        groupItems = $.map selectorGroup.split(','), (val) ->
          val.trim()
        for selector in groupItems
          elements = $(selector)
          if 'size' of elements && elements.size() > 0 or elements.length > 0
            for element in elements
              element = $(element)
              if element.data('query-set') is undefined
                element
                  .bind 'ajax:before', (e) =>
                    @.moveDataToStorage e.currentTarget
                  .bind 'ajax:beforeSend', (e, xhr, settings) =>
                    @.modifyAjaxSettings element, [xhr, settings]
                  .data 'query-set', true
          null
        null
      $
  
    ###  jQuery.rails.moveDataToStorage
 *
 *  @description Moves query data to internal storage explicitly.
 *  @example $.rails.moveDataToStorage('#ujs-link');
 *  @param mixed CSS selector or HTMLElement
 *  @return jQuery
 ###
    moveDataToStorage: (element) ->
      [element, data_string] = [$(element), '']

      if element.attr('params') isnt undefined
        [data, element] = [element.attr('params'), element.removeAttr('params')]
      
        try
          for key, value of $.parseJSON data
            piece = "#{key}=#{value}"
            data_string = if data_string.length is 0 then piece else "#{data_string}&#{piece}"
        catch error
          data_string = data
        
        element.attr('data-query-string', data_string).data('params', data)
      element
    
    ###  jQuery.rails.modifyAjaxSettings
 *
 *  @description Provides ability to modify XHR settings and apply options to XHR object on ajax:beforeSend event.
 *  @example $('#ujs-link').data('ajax-settings-modify', function(xhr, settings) {...});
 *  @param mixed CSS selector or HTMLElement
 *  @param array Array with XHR and settings objects
 *  @return boolean
 ###  
    modifyAjaxSettings: (element, data) ->
      [xhr, settings, element] = (() ->
        [data[0], data[1], $(element)]
      )()
      callback = if element.data('ajax-settings-modify') isnt \
                 undefined and typeof(element.data('ajax-settings-modify')) \
                 is 'function'
        element.data('ajax-settings-modify') 
      else
        () ->
      
      try
        status = callback.call element, xhr, settings
      catch error
        status = false
        
      status
      

  `// Finally, initialize helper on domReady`
  $(document).ready ->
    $.rails.handleDataToSend()
)(jQuery, ujsSelectors)