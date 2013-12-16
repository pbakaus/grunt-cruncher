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

	// Project configuration.
	grunt.initConfig({

		// Configuration to be run (and then tested).
		inlineEverything: {
			default_options: {
					options: {
					}
				}
			}
			
		}

	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

};
