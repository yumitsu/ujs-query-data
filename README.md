# JavaScript helper for jQuery unobtrusive adapter

It allows to pass `:params` parameter to options of `link_to` ActionView helper and send values as form data.

Example code: 
```erb
  <%= link_to 'Main page', root_path, :remote => true, :params => "ref=#{request.fullpath}", :method => "post" %>