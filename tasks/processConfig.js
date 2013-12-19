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

function stripPrivates(str) {
	str = str
			.replace(/.*\/\/\s?private.*/g, '')
			.replace(/.*\/\*\s?private\s?\*\/.*/g, '');
	return str;
};

module.exports = function(grunt) {

	grunt.registerMultiTask('processConfig', 'Processes a configuration file and automatically creates PHP and JSON counter parts', function() {

		var done = this.async();
		var fs = require('fs');
		var path = require('path');
		var JSON5 = require('json5');

		// merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			type: 'public',
			wrapper: false
		});

		function createConfig(contents, dest, dirname) {

			var collected = [];
			var parse = function(file) {
				if(options.type == 'public') {
					file = stripPrivates(file);
				}
				return JSON5.parse(file);
			};

			var file, inherits = contents;
			while(inherits) {

				file = inherits.indexOf("\n") > -1 ? inherits : fs.readFileSync(inherits, 'utf8');

				file = parse(file);
				inherits = file['extends'] ? path.join(dirname, file['extends']) : null;
				dirname = path.dirname(inherits);

				collected.push(file);

			}

			collected.reverse();

			// deep merge the inheritance chain
			var result = grunt.util._.merge.apply(this, [{}].concat(collected));

			// remove 'extends' from final output
			delete result.extends;

			// stringify
			result = JSON.stringify(result);

			if(options.wrapper) {
				result = options.wrapper.replace('$CONFIG', result);
			}

			fs.writeFileSync(dest, result);
			grunt.log.writeln('- wrote ' + options.type + ' JSON file to: ' + dest.cyan);

		}

		grunt.log.subhead('Parsing and generating config files...');

		this.files.forEach(function(file) {

			grunt.log.writeln('- processing ', file.src, '...');

			// get the contents of the source template(s)
			var dirname;
			var contents = file.src.filter(function(filepath) {
					// Remove nonexistent files (it's up to you to filter or warn here).
					if (!grunt.file.exists(filepath)) {
						grunt.log.warn('\tSource file "' + filepath + '" not found.');
						return false;
					} else {
						return true;
					}
				}).map(function(filepath) {

					if(!dirname) {
						dirname = path.dirname(filepath);
					}

					// Read and return the file's source.
					return grunt.file.read(filepath);
				}).join('\n');


			createConfig(contents, file.dest, dirname);

		});

		done();

	});

};
