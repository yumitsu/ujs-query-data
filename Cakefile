fs     = require('fs')
sys    = require('sys')
path   = require('path')
child  = require('child_process')
uglify = require('uglify-js')
rm     = require('rimraf')

build = (development) ->
  fs.mkdirSync('pkg/', 0755) unless path.existsSync('pkg/')
  fs.mkdirSync('tmp/', 0755) unless path.existsSync('tmp/')

  pack = (name, files) ->
    js = files.reduce ( (all, i) -> all + fs.readFileSync(i) ), ''

    unless development
      ast = uglify.parser.parse(js)
      ast = uglify.uglify.ast_mangle(ast)
      ast = uglify.uglify.ast_squeeze(ast)
      js  = uglify.uglify.gen_code(ast)

    fs.writeFileSync("pkg/#{name}.js", js)

  child.exec 'bash -c "coffee --compile --bare --output tmp/ src/ujs-query-data.coffee"', (error, message) ->
    if error
      process.stderr.write(error.message)
      process.exit(1) unless development
    if development
      sys.puts(message)
     
    child.exec 'bash -c "cp tmp/ujs-query-data.js pkg/ujs-query-data.src.js"', (error, message) ->
      if error
        process.stderr.write(error.message)
        process.exit(1) unless development
      if development
        sys.puts(message)

    pack("ujs-query-data.min", ["pkg/ujs-query-data.src.js"])

  rm './tmp', {}, (error) ->
    if error
      throw error

task 'build', 'Build and compress helper', ->
  build()
  
task 'watch', 'Rebuild helper after any source changes', ->
  build()
  console.log("Watching ./src")
  rebuild = (path, stats) ->
    console.log("Rebuilding #{path}")
    build()
  watcher = require('watch-tree').watchTree('./src', {'sample-rate': 5})
  watcher.on('fileModified', rebuild)