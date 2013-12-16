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

function stripComments(str) {
	str = str
		.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:[\s;]+\/\/(?:.*)$)/gm, '') // remove comments
	return str;
};

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

		// merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
		});

		grunt.log.subhead('Parsing and generating config files...');

		var publics = [], privates = [];
		var parse = function(file) {

			// create public JSON
			var publicFile = stripPrivates(file);
			publicFile = stripComments(publicFile).replace(/\,\s+([\}\]])/g, '$1');
			publicFile = JSON.parse(publicFile);

			file = stripComments(file).replace(/\,\s+([\}\]])/g, '$1');
			file = JSON.parse(file);

			return [file, publicFile]

		};


		var file, pair, inherits = options.src;
		while(inherits) {

			file = fs.readFileSync(inherits, 'utf8');
			pair = parse(file);
			inherits = pair[0]['extends'] ? path.join(path.dirname(inherits), pair[0]['extends']) : null;

			privates.push(pair[0]);
			publics.push(pair[1]);

		};

		privates.reverse();
		publics.reverse();

		var finalPrivate = JSON.stringify(grunt.util._.merge.apply(this, [{}].concat(privates)));
		var finalPublic = JSON.stringify(grunt.util._.merge.apply(this, [{}].concat(publics)));

		options.destinations.forEach(function(destination) {

			var cp = destination.type === 'public' ? finalPublic : finalPrivate;

			if(destination.wrapper) {
				cp = destination.wrapper.replace('$CONFIG', cp);
			}

			if (destination.path) {
				fs.writeFileSync(destination.path, cp);
				grunt.log.writeln('- wrote ' + destination.type + ' JSON file to: ' + destination.path.cyan);
			} else if (typeof destination.handler == "function") {
				destination.handler(cp);
			}

		});

		done();

	});

};
