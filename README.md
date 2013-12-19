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

This task runs through a source config file and generates out a series of config files for use in your application.
It supports comments and privates.

For example, our source config file looks like this:

```json
{ 
  "public": "Hi there, buddy",
  //We do not want anyone to know about this!
	"top_secret": /*private*/ "SHUSH",
}
```

processConfig can split out two versions of the Config file, one private.json that contains the private references (for backend configuration), and one public.json that has the private references stripped out. Nifty!

Finally, it can output a javascript file that can be wrapped into any framework you like.

### Usage Example

```js
processConfig: {
	source: {
		options: {
			src: 'PATH/TO/YOUR/CONFIGS/config.json',
				destinations: [
					{
						type: 'private',
						path: 'PATH/TO/YOUR/CONFIGS/gen/private.json'
					},
					{
						type: 'public',
						path: 'PATH/TO/YOUR/CONFIGS/gen/public.json'
					},
					{
						type: 'public',
						path: 'PATH/TO/YOUR/CLASSES/Config.js',
						wrapper: "/******* GENERATED, DO NOT MODIFY *******/\n core.Module('<%= pkg.name %>.Config', $CONFIG);"
					}
				]
			}
		}
	}
```

This example outputs two configs in JSON format, and also outputs a Config.js file that wraps the JSON in a Zynga core Module.

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

The location all of your partials are relative to.
For example: "source".

### partials
Type: `Array`
Default: []

The different HTML partials you want to inline.
For example: "non-retina", "retina".

### tags
Type: `Object`
Default: {}

#### link
Type: `Boolean|Object`
Default: false
     
 * engines
   This specifically allows fine control over Generated CSS Permutations.
   It is used in conjuction with our Vendor Permutator.
   When false, it just inlines.
     
   ##### For example:
   If you add an array of "engines" ['webkit','trident'] to "tags.link", it will create vendor-specific permutations (NAME.webkit.css, NAME.trident.css).

```js
link: {
	engines: ['webkit','trident','gecko']
}
```
     
 * rename
   We commonly want to store these into unique folders, so:
   If you add a rename function, you can rename your files however you want.
   When false, just places them in the same location.
     
   ##### For example:
   If you want the CSS to go into a /css/vendor directory, you would add "rename" to "tags.link":

```js
link: {
	rename: function(src, engine) {
		src = src.replace('/css/', '/css/vendor/').replace(/\.css$/, '.' + engine + '.css')
		return src;
	}
}
```

#### script
Type: `Object`
Default: false

 * rename

### Files
Type: `Array`
Default: []
This is an array of Objects pointing to the directories you want scanned for inlining.

##### For example:
```js
files: [
	{
		expand: true,
		cwd: 'PATH/TO/YOUR/TEMPLATES',
		src: '*.built.html',
		dest: 'PATH/TO/YOUR/BUILD/'
	}
]
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
			relativeTo: 'source',
			partials: ['non-retina', 'retina', 'pirate-version'],
			tags: {
				link: false,
				script: {
					rename: function(fileName) {

						var extensionStart = fileName.lastIndexOf('.js');
						var firstHalf = fileName.substr(0, extensionStart);
						var secondHalf = fileName.substr(extensionStart);

						return firstHalf + secondHalf;
					}
				}
			}
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
