"use strict"

module.exports = function(grunt)
{
	var amdclean = require("amdclean");
	
	// Options that are specific to this project, or that override the defaults
	// of amdclean.
	var defaultOptions = {
		
	};
	
	function warnAboutPossiblyUnsupportedOptions(options)
	{
		// Allow for checking whether provided options are possibly spelled wrong,
		// so the user can be informed about them. This listing can also be used for
		// pointing out that certain features of newer version of AMDClean might not
		// work as intended.
		var supportedOptions = [
			"aggressiveOptimizations", 
			"createAnonymousAMDModule",
			"commentCleanName", 
			"code",
			"config", 
			"escodegen", 
			"esprima", 
			"filePath",
			"globalModules", 
			"ignoreModules", 
			"prefixMode", 
			"prefixTransform", 
			"removeAllRequires", 
			"removeModules", 
			"removeUseStricts", 
			"shimOverrides", 
			"transformAMDChecks", 
			"wrap", 
			"IIFEVariableNameTransform"
		];
		
		for (var key in options)
		{
			if (options.hasOwnProperty(key))
			{
				if (supportedOptions.indexOf(key) === -1)
				{
					grunt.log.warn("Provided option \"" + key + "\" is not explicitly supported. ");
				}
			}
		}
	}
	
	function removeSetOptionsThatShouldNotBeUsed(options)
	{
		
		// The "grunt-amdclean" delegates most options straight to "amdclean", some
		// options make little sense in the context of Grunt however. Those are thus
		// not supported by this module. The following is a listing of said options,
		// and which alternative should be used.
		var amdcleanOptionsThatShouldNotBeUsed = {
			code: "Use Grunt's \"files\" property instead of specifying the \"code\" option.",
			filePath: "Use Grunt's \"files\" property instead of specifying the \"filePath\" option.",
			sourceMap: "Support for saving source maps is not yet implemented."
		}
		
		// Inform the user of this module that certain options for amdclean are not
		// supported by this Grunt plugin, and which option should instead be used.
		for (var key in amdcleanOptionsThatShouldNotBeUsed)
		{
			if (amdcleanOptionsThatShouldNotBeUsed.hasOwnProperty(key))
			{
				if (options.hasOwnProperty(key))
				{
					grunt.log.warn(amdcleanOptionsThatShouldNotBeUsed[key]);
					delete options[key];
				}
			}
		}
	}
	
	
	grunt.registerMultiTask("amdclean", "Removes the need for an AMD loader.", function()
	{
		var options = this.options(defaultOptions);
		
		warnAboutPossiblyUnsupportedOptions(options);
		removeSetOptionsThatShouldNotBeUsed(options);
		
		this.files.forEach(function(file)
		{
			// Remove non-existing files from the list of files to process; there is
			// no point in processing them after all.
			var files = file.src.filter(function keepExistingFiles(filepath)
			{
				// Based on the example in grunt's documentation.
				// https://gruntjs.com/api/inside-tasks#inside-multi-tasks
				if (!grunt.file.exists(filepath))
				{
					// Indicate which files won't be processed. This can be helpful for 
					// figuring out why certain files aren't generated.
					grunt.log.warn("Source file \"" + filepath + "\" not found.");
					return false;
				}
				else
				{
					return true;
				}
			});
			
			// Little can be done if no (existing) source files have been specified.
			if (files.length === 0)
			{
				grunt.log.warn("No source files to process for \"" + file.dest + "\"");
				// Continue to the next glob, to see if more progress can be made there.
				return;
			}
			// AMDClean is typically used to remove all/most AMD definitions after the
			// relevant files have been bundled. so an AMD loader is no longer needed.
			// This implies that everything needed is already in a single file. It 
			// thus makes little sense to specify multiple files that should be 
			// written to a single output file.
			// 
			// This might get changed in future versions where a destination can be 
			// a folder in which all input files get stored. For now, use Grunt's 
			// "expand" option to have it generate a separate path for each file.
			else if (files.length > 1)
			{
				grunt.log.warn("Cannot map input files [" + files.join(", ") + "] to single output file \"" + file.dest + "\".");
				return;
			}
			
			files.forEach(function(src)
			{
				// The "unsupported" "code" option is used to provide amdclean with the 
				// code from which to remove AMD definitions. 
				options.code = grunt.file.read(src);
				grunt.file.write(file.dest, amdclean.clean(options));
			});
		});
	});
}
