/*
 *
 * grunt-cruncher
 * http://github.com/zynga/grunt-cruncher
 *
 * Copyright 2013, Zynga Inc.
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/grunt-cruncher/master/LICENSE-MIT
 *
 */

'use strict';

module.exports = function(grunt) {

	grunt.registerMultiTask('inlineEverything', 'Inlines everything and creates permutated files', function() {

		var done = this.async();
		var fs = require('fs');
		var path = require('path');

		// merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			relativeTo: 'source',
			partials: ['1x', '2x', 'universal'],

			tags: {
				// fine control over the generated CSS permutations
				link: {
					engines: ['webkit', 'trident', 'gecko'],
					rename: function(src, engine) {
						src = src.replace('/css/', '/css/permutated/').replace(/\.css$/, '.' + engine + '.css')
						return src;
					}
				},
				// control over JS inlining
				script: {
					rename: function(fileName) {

						var extensionStart = fileName.lastIndexOf('.js');
						var firstHalf = fileName.substr(0, extensionStart);
						var secondHalf = fileName.substr(extensionStart);

						return firstHalf + secondHalf;
					}

				}
			}
		});

		function doPartialMagicToFileName(fileName, partialPath) {

			if(fileName.indexOf('{global}') > -1) {
				fileName = fileName.replace('{global}', '');
			}

			if(fileName.indexOf('{local}') > -1) {
				fileName = fileName.replace('{local}', '');
				fileName = path.join(partialPath, fileName);
			}
			
			return fileName;
		}

		function inlineLinkTags(dest, html, partialPath) {

			var sheets = [];

			var replaceFn = function(full, start, fileName, end) {
				
				// magic replacements for partials
				if(partialPath) {
					fileName = doPartialMagicToFileName(fileName, partialPath);
				}

				sheets.push(fileName);

				if(options.tags.link && options.tags.link.rename) {
					fileName = options.tags.link.rename(fileName, null);
				}
				
				var file = fs.readFileSync(path.join(options.relativeTo, fileName), 'utf8');
				return '<style>' + file + '</style>';
			};

			var inlined = html.replace(/(\<link[^\>]+href\=[\"\'])(?![^\"\']*\/\/)([^\"\']+)([\"\'][^\>]*rel\=[\"\']stylesheet[\"\'][^\>]*\>)/g, replaceFn);
			inlined = inlined.replace(/(\<link[^\>]*rel\=[\"\']stylesheet[\"\'][^\>]*href\=[\"\'])(?![^\"\']*\/\/)([^\"\']+)([\"\'][^\>]*\>)/g, replaceFn);

			// remove old file if it exists..
			if(fs.exists(dest)) {
				fs.unlinkSync(dest);
			}

			// create all necessary directories, if needed
			grunt.file.mkdir(path.dirname(dest));

			// create compressed HTML file
			fs.writeFileSync(dest, inlined);

			if(sheets.length)
				grunt.log.writeln('  - inlined the following stylesheets: ', grunt.log.wordlist(sheets));

			grunt.log.writeln(('  - created the following build: ' + dest).green);

		}

		function createStylePermutedBuilds(dest, html, partialPath) {

			var sheets = [], files = [];
			options.tags.link.engines.forEach(function(engine, index) {

				var replaceFn = function(full, start, fileName, end) {
					
					// magic replacements for partials
					if(partialPath) {
						fileName = doPartialMagicToFileName(fileName, partialPath);
					}

					if(index === 0) sheets.push(fileName);

					if(options.tags.link.rename) {
						fileName = options.tags.link.rename(fileName, engine);
					} else {
						fileName = fileName.replace(/\.css$/, '') + '.' + engine + '.css';
					}
					
					var file = fs.readFileSync(path.join(options.relativeTo, fileName), 'utf8');
					return '<style>' + file + '</style>';
				};

				var permutation = html.replace(/(\<link[^\>]+href\=[\"\'])(?![^\"\']*\/\/)([^\"\']+)([\"\'][^\>]*rel\=[\"\']stylesheet[\"\'][^\>]*\>)/g, replaceFn);
				permutation = permutation.replace(/(\<link[^\>]*rel\=[\"\']stylesheet[\"\'][^\>]*href\=[\"\'])(?![^\"\']*\/\/)([^\"\']+)([\"\'][^\>]*\>)/g, replaceFn);

				var newFileName = dest.replace(/\.html$/, '.' + engine + '.html');
				files.push(newFileName);

				// remove old file if it exists..
				if(fs.exists(newFileName)) {
					fs.unlinkSync(newFileName);
				}

				// create all necessary directories, if needed
				grunt.file.mkdir(path.dirname(newFileName));

				// create compressed HTML file
				fs.writeFileSync(newFileName, permutation);

			});

			if(sheets.length)
				grunt.log.writeln('  - inlined the following stylesheets (permutations: ' + grunt.log.wordlist(options.tags.link.engines, {color: '' }) + '): ', grunt.log.wordlist(sheets));

			grunt.log.writeln('  - created the following style-permutated builds: '.green, grunt.log.wordlist(files, { color: 'green' }));

		}

		function inlineScriptTags(html, partialPath) {

			var tags = [];
			html = html.replace(/<script[^\>]+src\=[\"\'](?![^\"\']*\/\/)([^\"\']+)[\"\'][^\>]*\><\/script>/g, function(full, fileName) {

				// magic replacements for partials
				if(partialPath) {
					fileName = doPartialMagicToFileName(fileName, partialPath);
				}

				fileName = path.join(options.relativeTo, fileName);
				if(options.tags.script.rename) {
					fileName = options.tags.script.rename(fileName);
				}

				tags.push(fileName);
				var file = fs.readFileSync(fileName, 'utf8');
				return '<script>' + file + '</script>';
			});

			if(tags.length)
				grunt.log.writeln('  - inlined the following script tags: ', grunt.log.wordlist(tags));

			return html;

		}

		function getExtension(fileName) {
			var ext = path.extname(fileName || '').split('.');
			return ext[ext.length - 1];
		}

		function inlineImageTags(html, partialPath) {

			var images = [];
			html = html.replace(/(<img[^\>]+src\=[\"\'])(?![^\"\']*\/\/)([^\"\']+)([\"\'][^\>]*\>)/g, function(full, start, fileName, end) {

				// magic replacements for partials
				if(partialPath) {
					fileName = doPartialMagicToFileName(fileName, partialPath);
				}

				var imageData = fs.readFileSync(path.join(options.relativeTo, fileName));
				var extension = getExtension(fileName) || 'png';
				var base64 = imageData.toString('base64');

				images.push(fileName);
				return start + 'data:image/' + (extension == 'jpg' ? 'jpeg' : extension) + ';charset=utf-8;base64,' + base64 + end;
			});

			// inline TexturePacker spritemaps in an optimized, slimmed down format
			html = html.replace(/(\<img[^>]+spritemap\=)([\"\'])([^\"\']+)([\"\'])([^>]+\>)/g, function(full, start, quoteStart, map, quoteEnd, end) {

				// magic replacements for partials
				if(partialPath) {
					map = doPartialMagicToFileName(map, partialPath);
				}

				var jsMap = fs.readFileSync(path.join(options.relativeTo, map));
				jsMap = JSON.parse(jsMap).frames;
				for(var frame in jsMap) {
					jsMap[frame] = jsMap[frame].frame;
				}

				return start + "'" + JSON.stringify(jsMap) + "'" + end;
			});

			if(images.length)
				grunt.log.writeln('  - inlined the following images: ', grunt.log.wordlist(images));

			return html;

		}

		grunt.log.subhead('Processing HTML files..');

		this.files.forEach(function(file) {

			grunt.log.writeln('- processing ', file.src, '...');

			// get the contents of the source template(s)
			var contents = file.src.filter(function(filepath) {
					// Remove nonexistent files (it's up to you to filter or warn here).
					if (!grunt.file.exists(filepath)) {
						grunt.log.warn('\tSource file "' + filepath + '" not found.');
						return false;
					} else {
						return true;
					}
				}).map(function(filepath) {
					// Read and return the file's source.
					return grunt.file.read(filepath);
				}).join('\n');

			var dirname = path.relative(options.relativeTo, path.dirname(file.src[0]));

			// inline all JavaScript
			contents = inlineScriptTags(contents, dirname);

			// inline all images
			contents = inlineImageTags(contents, dirname);

			// inline all CSS and create permutations of the file in the build/ folder
			if(options.tags.link && options.tags.link.engines) {
				createStylePermutedBuilds(file.dest, contents, dirname);
			} else {
				inlineLinkTags(file.dest, contents, dirname);
			}
			

		});

		done();

	});

};
