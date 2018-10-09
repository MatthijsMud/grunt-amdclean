# grunt-amdclean v1.0.0
> Use AMDClean as a grunt task.

## Getting started
If you haven't used [Grunt](https://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you are familiar with that probcess, you may install this plugin with this command:
```bs
npm install git+https://git@github.com/MatthijsMud/grunt-amdclean.git --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:
```js
grunt.loadNPMTasks("grunt-amdclean");
```

## AMDclean task
_Run this task with the `grunt amdclean` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](https://gruntjs.com/configuring-tasks) guide.

### options
[grunt-amdclean](https://github.com/MatthijsMud/grunt-amdclean) is little more than a wrapper for [amdclean](https://github.com/gfranko/amdclean). Therefore most options for that module are also available for this one. See the documentation of that project for available options, and applicable values.
#### Options of grunt-amdclean
All of the following options of AMDClean are also options of this project. 
> `aggressiveOptimizations`, `createAnonymousAMDModule`, `commentCleanName`, `config`, `escodegen`, `esprima`, `globalModules`, `ignoreModules`, `prefixMode`, `prefixTransform`, `removeAllRequires`, `removeModules`, `removeUseStricts`, `shimOverrides`, `transformAMDChecks`, `wrap`, `IIFEVariableNameTransform`.

Ones that aren't listed here are either deliberately not supported (as detailed further below), or have been newly added to AMDClean. The latter of which might work out of the box.

_This project currently doesn't have any options of its own._

#### Unsupported AMDClean options
A few options require some extra work that hasn't been taken care of (yet), or make little sense in the context of a task runner like Grunt. This applies for the following options.

<table>
<tr><th>Name</th><th>Reason</th></tr>
<tr><th>code</th><td rowspan="2"><p>AMDClean has no option for specifying the output filename, as it only returns (an object with) the generated code. For this project it would either mean to generate a filename, overwrite the input file, or add a new option for it.</p><p>While the latter introduces the least amount of issues, it misses out of [Grunt's abstraction for specifying files on which to operate](https://gruntjs.com/configuring-tasks#files) and uniformity with other projects that use it. Hence the `code` and `filePath` options are dropped in favor of it.</p></td></tr>
<tr><th>filePath</th></tr>
<tr><th>sourceMap</th><td>Generated source maps currently don't get saved. Time spend on generating them is thus wasted. (It also modifies the output of AMDClean, which is not yet handled correctly.)</td></tr>
</table> 

### Usage examples
AMDClean is normally used after Require.js's optimizer ([r.js](https://github.com/requirejs/r.js)) has finished concatenating all files that depend on one another, using the `onModuleBundleComplete` callback. This is before the file gets optimized (stripping of dead code paths, and renaming of certain variables). Said optimizer is also available as a package for grunt: [grunt-contrib-requirejs](https://github.com/gruntjs/grunt-contrib-requirejs).

As this is a grunt task, the exact timing cannot be entirely replicated, but the following configuration should get close though. The optimizer of choice should be manually started as a result. 

Why not use the `onModuleBundleComplete` callback then? The fact that it is a callback makes it so Grunt does not replace parts of strings (`"<%= pkg.name %>"` for example) that you might want; which could be useful for determining the name to use for the global object in case of [UMD](https://github.com/umdjs/umd).

```js
requirejs: {
	compile: {
		options: {
			baseUrl: "src",
			name: "index",
			out: "build/step1/compiled.js",
			// Optimizer might have better effect later.
			optimize: "none"
		}
	},
	// Any number of other builds (with different configs?).
}
```
At this point one, or more, file(s) should have been created that might no longer need AMD declarations anymore. All dependencies could already be in the file after all. Adding a loader just to solve the load order that should pretty much always be the same, is a tad superfluous when it can be determined at build time, after all.

While a single configuration like the following could be used for this purpose, certain options (like `config`, `globalModules`, `ignoreModules`, etc.) might not really be suited for each file. Different build target should be made in that case.
```js
amdclean: {
	compile: {
		files: [{
			expand: true,
			src: ["**/*.js"],
			// Strip AMD from files in the folder...
			cwd: "build/step1/",
			// ... and place the results in this folder.
			dest: "build/step2/"
		}],
		options: {
			// Any of the AMDClean options.
		}
	}
}
```
```js
grunt.registerTask("default", ["requirejs", "amdclean"]);
```
Each build step generates code based on what is provided to it. Overwriting the same file for each build step is possible, but this makes it harder to figure out in which build step an issue gets introduced (if it does). Or issues with the configuration file for that matter.

Another possible benefit from generating separate files, is that a single one could be used for multiple steps following them, rather than repeating all previous steps up to it. For example:
> A production and development build are usually little different from each other, aside from some debug statements and internal function names. This can typically be achieved by an optimizer, like [Uglify]().

## Release History
| Date       | Version | Release notes |
| ---------- | ------- | ------------- |
| 2018-10-09 | v1.0.0  | Bare bones first release.
