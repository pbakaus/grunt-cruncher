grunt-cruncher
==================

Crunches every dependency of your web app into a single distributable file structure.

Tasks:

#### processConfig

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
less: {
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
		},
}
```

This example outputs two configs in JSON format, and also outputs a Config.js file that wraps the JSON in a Zynga core Module.
