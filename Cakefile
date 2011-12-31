fs      = require('graceful-fs')
util    = require('util')
path    = require('path')
child   = require('child_process')
uglify  = require('uglify-js')
rm      = require('rimraf')
cterm   = require('color-terminal')
watcher = require('watch-tree')
cwd     = process.cwd() 

option '-d', '--development', 'enable development mode'
option '-r', '--sample-rate [msec]', 'refresh sample rate'

[srcDir, tmpDir, pkgDir]                          = [cwd + "/src", cwd + "/tmp", cwd + "/pkg"]
[minimizedFile, sourceFile, tempFile, coffeeFile] = ["#{pkgDir}/ujs-query-data.min.js", "#{pkgDir}/ujs-query-data.src.js", "#{tmpDir}/ujs-query-data.js", "#{srcDir}/ujs-query-data.coffee"]
[rmf, rsf, rtf, rcf]                              = [minimizedFile.replace(cwd, '.'), sourceFile.replace(cwd, '.'), tempFile.replace(cwd, '.'), coffeeFile.replace(cwd, '.')]

namespace = @
[_$, namespace] = [{}, @]

_$._initLogger = () ->
  _$ = @
  notice = (text, caption = 'Notice') ->
    _$.log(text, 'info', caption)
    _$
  
  warn = (text, caption = 'Warning') ->
    _$.log(text, 'warning', caption)
    _$
  
  error = (text, caption = 'Error') ->
    _$.log(text, 'error', caption)
    _$
  
  info = (text, caption = 'Inform') ->
    _$.log(text, 'info', caption)
    _$
  
  internal = (text, caption = 'Debug') ->
    _$.log(text, 'internal', caption)
    _$
  
  [_$.notice, _$.warn, _$.error, _$.info, _$.internal] = [notice, warn, error, info, internal]
  _$
  

_$.log = (text, params...) ->
  if !text? then throw "No text to output"
  
  if params? and params.length > 0
    [status, caption] = [params[0], params[1]]
  else
    status = 'info'
    
  caption = caption ? status
  
  switch status
    when 'info'
      [lc, cc, rc, t] = ['cyan', {"attribute": "bold", "foreground": "cyan"}, 'cyan', {"attribute": "bold", "foreground": "green"}]
    when 'warning'
      [lc, cc, rc, t] = ['yellow', {"attribute": "bold", "foreground": "yellow"}, 'yellow', {"attribute": "bold", "foreground": "magenta"}]
    when 'error'
      [lc, cc, rc, t] = ['red', {"attribute": "bold", "foreground": "red"}, 'red', {"attribute": "bold", "foreground": "yellow"}]
    when 'internal'
      [lc, cc, rc, t] = ['yellow', {"attribute": "bold", "foreground": "yellow"}, 'yellow', {"attribute": "bold", "foreground": "green"}]
    else throw "Undefined log status"
  
  pos = if (12 - (caption.length + 2)) <= 0 then 4 else (12 - (caption.length + 2))
  
  cterm
    .color(lc).write('[').reset()
    .color(cc).write(caption).reset()
    .color(rc).write(']').reset()
    .right(pos)
    .color(t).write(text).reset()
    .nl().reset()
  null
  
_$._init = (params...) ->
  [_$, root] = params

  if root isnt undefined and _$ isnt undefined
    [_$] = [_$._initLogger.call(_$)]
    [root] = [_$]
    [exports, module.exports] = [root, root]
  _$

_$.init = (options, callback) ->
  _$.notice('New process started.', 'Process')
  
  options['sample-rate']      ?= 5
  options['development']      ?= false
  options['compressorStatus'] = if options['development'] is false then 'enabled' else 'disabled'
  
  [sr, de, ds, ta] = [options['sample-rate'], options['development'], options['compressorStatus'], options.arguments[0]]
  
  if de
    _$.internal("Task: '#{options.arguments[0]}'")
      .internal("Options: #{options.inspect}")
      .info("Working directory is #{cwd}", 'Debug')
  
  _$.internal("Compression #{ds}.", 'Builder')
  if options.arguments[0] is 'watch'
    _$.internal("Watching #{srcDir.replace(cwd, '.')}, refresh rate #{sr} msec", 'Watcher')
  if options.arguments[0] is 'build'
    _$.internal("Building #{rcf} to #{pkgDir.replace(cwd, '.')}", 'Builder')
  
  [_$.task, ret] = [options.arguments[0], [sr, de]]
  
  if callback isnt undefined
    callback.call _$ , ret
  else
    ret
  
_$.exit = (ns) ->
  ns ?= _$
  
  cterm.clearLine().left(2).reset()
  
  if ns.task is 'build'
    ns.notice('Builder finished.', 'Builder')
  if ns.task is 'watch'
    ns.notice('Watcher terminated.', 'Watcher')
  ns.notice('Bye.')
  process.removeAllListeners('SIGINT')
  process.removeAllListeners('exit')
  process.exit(0)

_$.build = (development) ->
  development ?= false

  fs.mkdirSync(pkgDir, 0755) unless path.existsSync(pkgDir)
  fs.mkdirSync(tmpDir, 0755) unless path.existsSync(tmpDir)
  
  _t = _$

  pack = ->
    unless development
      _t.internal("Compressing #{rsf} to #{rmf}...", 'Packer')
      
      js  = fs.readFileSync(tempFile).toString()
      ast = uglify.parser.parse(js)
      ast = uglify.uglify.ast_mangle(ast)
      ast = uglify.uglify.ast_squeeze(ast)
      js  = uglify.uglify.gen_code(ast)

      try
        fs.writeFileSync(minimizedFile, js)
        _t.internal("Compressed successfully!", 'Packer')
      catch error
        _t.error(error.message, 'Packer')
        process.exit(1)   
        
  cleanup = (dir) ->
    _t.notice("Cleaning temporary directory: #{dir.replace(cwd, '.')}...", 'Rimraf')
    rm dir, false, (error) ->
      if error
        _t.error("Error callback called during removal of '#{dir.replace(cwd, '.')}': #{error.code}.", 'Rimraf')
        process.exit(1) unless development
      else
        _t.notice('Clean.', 'Rimraf')
    
  bcall = (error, message) ->
    if error
      _t.error(error.message, 'ChildExec')
      process.exit(1) unless development
    if development
      _t.warn(message)

  child.exec "bash -c \"coffee --compile --bare --output #{tmpDir} #{coffeeFile}\"", (e, m) ->
    bcall(e, m)
    _t.internal("Compiling '#{rcf}' to '#{rsf}'.", 'Builder')
    child.exec "bash -c \"cp #{tempFile} #{sourceFile}\"", (ee, mm) ->
      _t.internal("Compiled successfully.", 'Builder')
      bcall(ee, mm)
      pack()
      cleanup(tmpDir)
      process.on('exit', ->
        _t.exit(_t)
      )
      process.on('SIGINT', ->
        _t.exit(_t)
      )

task 'build', 'Build and compress helper', (options) ->
  [_$] = [_$._init(_$, namespace)]
  
  _$.init(options, (params) ->
    [sr, de] = params
    @.build(de)
  )
  
task 'watch', 'Rebuild helper after any source changes', (options) ->
  [_$] = [_$._init(_$, namespace)]
  [sr, de] = _$.init(options)
  
  _$.build(de)

  rebuild = (path, stats) ->
    _$.notice("Caught '#{path.replace(cwd, '.')}' modification, invoking rebuild...", 'Watcher')
    _$.build(de)
    _$.notice('Rebuilded successfully!', 'Watcher')
    
  watcher = watcher.watchTree(srcDir, {'sample-rate': sr})
  watcher.on('fileModified', rebuild)