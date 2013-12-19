grunt-cruncher
==================

> Crunches every dependency of your web app into a single distributable file structure.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cruncher --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cruncher');
```

# Tasks:

## processConfig

This task runs through a source config file and generates a consumable config file for use in your application.
It supports comments and privates.

For example, our source config file looks like this:

```json
{ 
  "public": "Hi there, buddy",
  //We do not want anyone to know about this!
	"top_secret": /*private*/ "SHUSH",
}
```

processConfig can split out two versions of the Config file, one private.json that contains the private references (for backend configuration), and one public.json that has the private references stripped out. It also ensures that the file is valid JSON in the end. Nifty!

Finally, it can output a javascript file that can be wrapped into any framework you like.

### Usage Example

```js
processConfig: {

	'public': {
		src: 'config.json',
		dest: 'config.public.json'
	},

	'private': {

		options: {
			type: 'private'
		},

		src: 'config.json',
		dest: 'config.private.json'

	}
	
}
```

This example outputs two configs in JSON format, both inheriting from root.json through the "extends" syntax.

## inlineEverything

This task takes an HTML file(s) containing CSS, Javascript and Image Assets, and output Vendor-Permutated HTML with all of this content inlined (what else did you expect?) Images are base64 encoded and served inlined as well. It also supports multiple partials, say, for example: Retina and Non-Retina Asset Packs.

For example:

```html
<html>
<script src="MyApp.js"></script>
<link href="MyStyles.css" rel="stylesheet" type="text/css">
</html>
```

would output:
```html
<html>
<script>alert('foo');</script>
<style>body{background-image:url(data:image/png;base64.......);}</style>
</html>
```

### Options

#### relativeTo
Type: `String`

Default: `source`

The location all of your included files are relative to. If your index.html is in source/index.html, that would be "source".

### tags
Type: `Object`
Default: {}

#### link
Type: `Boolean|Function`
Default: true
     
Enables or disables the inlining of stylesheets. If you want to map a certain location to another one (i.e. "style.css" to "generated/style.css"), pass a function instead of "true". That function will then receive the found path, and allows you to return where to include from, like so:

```js
link: function(src, engine) {
	src = src.replace('/css/', '/css/generated/').replace(/\.css$/, '.' + engine + '.css');
	return src;
}
```

Hint: grunt-cruncher will automatically search for vendor mutated versions of your CSS (i.e. style.webkit.css) and build a webkit-only build of your file then!

#### script
Type: `Boolean|Function`
Default: true

Same as with link, if you want to map the sources files differently, pass a callback:

##### For example:
```js
script: function(src) {
	src = src.replace('/js/', '/css/generated/');
	return src;
}
```

### Usage Example

Given this directory structure:
<pre>
build/
source/
	css/
	img/
	js/
	partials/
		non-retina/ 
			partial.html
			css/
			img/
		retina/ 
			partial.html
			css/
			img/
		pirate-version/ 
			partial.html
			css/
			img/
	templates/
		index.html
		generated/
			index.built.html
</pre>	
```js
inlineEverything: {
	templates: {
		options: {
			relativeTo: 'source'
		},

		files: [
			{
				expand: true,
				cwd: SOURCE_FOLDER + '/templates/generated',
				src: '*.built.html',
				dest: 'build'
			},
			{
				expand: true,
				cwd: SOURCE_FOLDER + '/partials',
				src: '*/partial.html',
				dest: 'build/partials'
			}
		]

	}
}
```
