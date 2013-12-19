module.exports = function(grunt) {

	grunt.initConfig({

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

	});

	grunt.loadNpmTasks('grunt-cruncher');

	grunt.registerTask('config', ['processConfig']);

};
