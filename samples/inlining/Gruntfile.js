module.exports = function(grunt) {

	grunt.initConfig({

		inlineEverything: {

			simpleExample: {

				options: {
					tags: {
						link: true,
						script: true
					}
				},

				src: 'index.html',
				dest: 'index.crunched.html'

			}
			
		}

	});

	grunt.loadNpmTasks('grunt-cruncher');

	grunt.registerTask('inline', ['inlineEverything']);

};
