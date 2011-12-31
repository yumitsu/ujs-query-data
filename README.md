# JavaScript helper for jQuery unobtrusive adapter

## Features

It allows to pass `:params` parameter to options of `link_to` ActionView helper and send values as form data.
Example code:

```erb
  <%= link_to 'Main page', root_path, :remote => true, :params => "ref=#{request.fullpath}", :method => "post" %>
```

Renders to:

```html
  <a href="/" data-remote="true" data-method="post" data-query-string="ref=/articles/1">Main page</a>
```

Clicking on resulting link will lead to AJAX POST with form data `{ref: '/article/1'}`. 

## Multiple params

You can use JSON-encoded hashes for multiple params.
Example code:

```erb
  <%- data = {:ref => request.fullpath, :user_id => current_user.id} %>
  <%= link_to 'Main page', root_path, :remote => true, :params => data.to_json, :method => "post" %>
```

Renders to:

```html
  <a href="/" data-remote="true" data-method="post" data-query-string="{&quot;ref&quot;:&quot;/articles/1&quot;,&quot;user_id&quot;:2}">Main page</a>
```

## Use

Copy `pkg/ujs-query-data.min.js` for production use or `pkg/ujs-query-data.src.js` 
for development to your project javascripts dir and include helper in your layout.

Example for Rails 3.*:

```erb
  <%= javascript_include_tag "ujs-query-data.min.js" %>
```

For use with assets pipeline add `//=require ujs-query-data.min` to your manifest file.

## Development and build

To develop and build, you need [Node.js], [npm] and [coffee-script] to install dependencies.
For Ubuntu:

```bash
  sudo add-apt-repository ppa:chris-lea/node.js
  sudo add-apt-repository ppa:gias-kay-lee/npm
  sudo add-apt-repository ppa:gias-kay-lee/coffeescript
  sudo apt-get update
  sudo apt-get install nodejs npm coffeescript
```

For Mac OS X:

```bash
  brew install node
  curl http://npmjs.org/install.sh | sh
  npm -d install -g coffee-script
```

To build helper, install dependencies via [npm] from helper's directory:

```bash
npm -d install .
```

And then run `cake build`:

```bash
./node_modules/.bin/cake build
```

To watch on modifications and recompile helper package on-the-fly, run `./node-modules/.bin/cake watch`.

## Testing

No tests available at this time.

## Bug reports

Use [issue tracker](https://github.com/yumitsu/ujs-query-data/issues).

## License

MIT License

[Node.js]: http://nodejs.org/
[npm]: http://npmjs.org/
[coffee-script]: http://jashkenas.github.com/coffee-script/