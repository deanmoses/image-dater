#!/usr/bin/env osascript -l JavaScript

//
// Apple OS X javascript to check Tacocat image files before publicaction.
//
// Recursively processes a set of folders.  Displays message if any file doesn't 
// meet criteria for publishing to tacocat, such as:
//  * not being a *.jpg
//  * not having an Exif date captured
//

var SystemEvents = Application("System Events");
var fileManager = $.NSFileManager.defaultManager;
var app = Application.currentApplication();

// OSX has a set of standard scripting additions (plug-ins for scripts) 
// that enhance the functionality of applications by providing the 
// ability to do things like speak text, display user interaction dialogs, 
// and more. To use them, an application must explicitly set the 
// includeStandardAdditions flag to true.
app.includeStandardAdditions = true;

// Array of error messages to display to the user
var errorMessages = [];

// Called if the javascript is run as a shell script
function run(argv) {
    // Each argument passed in should be the path to a folder, or 
    // possibly a file (depends on how the Automator script is set up).
    // Iterate over each argument and process it as a folder or file.
    for (var i = 0; i < argv.length; i++) {
        var arg = argv[i];
        if (!pathExists(arg)) {
            alert("Script was invoked with unexpected input", "I was given an invalid file or directory path:\n" + arg)
        }
        else if (pathIsFolder(arg)) {
            //alert("it's a folder", arg);
            processFolder(arg);
        }
        else {
            //alert("it's a file", arg);
            processFile(arg);
        }
    }

    if (errorMessages.length == 0) {
        alert("You're good to upload", "No problems were found");
    }
    else {
        var errorBody = "The following problems were found:";
        for (i = 0; i < errorMessages.length; i++) {
            errorBody += "\n\n" + errorMessages[i];
        }
        alert("Don't Upload", errorBody);
    }
}

// Process a folder
// The folder variable is string path to folder
function processFolder(folderString) {
    //alert("Processing Folder", folderString);

    // Convert path string to a Path object
    var folder = Path(folderString);

    // Retrieve the visible items in folder and loop through them
    var folderItems = app.listFolder(folder, { invisibles: false });
    for (var item of folderItems) {
        var currentItem = `${folderString}/${item}`;
        //alert("Folder Item", currentItem.toString());
        if (pathIsFolder(currentItem.toString())) {
            console.log("No Subfolders", "No subfolders should exist.  Please move: " + currentItem.toString());
            addError("Move subfolder:\n" + item);
        }
        else {
            processFile(currentItem);
        }
    }
    // Add additional folder processing code here
}

var fileTypesToProcess = ["JPEG"]; // For example: {"PICT", "JPEG", "TIFF", "GIFf"}
var extensionsToProcess = ["jpg"]; // For example: {"txt", "text", "jpg", "jpeg"}, NOT: {".txt", ".text", ".jpg", ".jpeg"}
var typeIdentifiersToProcess = ["public.jpeg"]; // For example: {"public.jpeg", "public.tiff", "public.png"}

// Process a file
// The file variable is an instance of the Path object
function processFile(file) {
    //alert("Processing File", file.toString());
    var alias = SystemEvents.aliases.byName(file);
    var extension = alias.nameExtension();
    //alert("Extension", extension);
    var fileType = alias.fileType();
    //alert("File Type", fileType);
    var typeIdentifier = alias.typeIdentifier();
    //alert("Type Identifier", typeIdentifier);
    //alert("Kind", alias.kind());

    // Sometimes one of these type things, like the fileType, come back null.
    // So we look at all of them and match on any of them.
    if (fileTypesToProcess.includes(fileType) 
        || extensionsToProcess.includes(extension) 
        || typeIdentifiersToProcess.includes(typeIdentifier)) 
    {
        console.log("Valid type of file", file.toString());
        processImage(file);
    }
    else {
        console.log("Invalid type of file", file.toString());
        addError("Invalid type of file [" + extension + "]:\n" + alias.displayedName());
    }
}

// Check that the image has the right metadata in it
// file: a Path object
function processImage(file) {
    var cmd = "exiftool -exif:DateTimeOriginal -iptc:DateCreated " + file.toString();
    var cmdResults = app.doShellScript(cmd);
    //console.log("Command results: ", cmdResults);
    if (cmdResults.length <= 0) {
        addError("File does not have Exif DateCreated:\n" + getFileDisplayedName(file));
    }
}

// Return true if path exists
// path: string path
function pathExists(path) {
    return fileManager.fileExistsAtPath(path);
}

// Return true if path is a valid folder
// path: string path to a folder
function pathIsFolder(path) {
    var isDir = Ref();
    return fileManager.fileExistsAtPathIsDirectory(path, isDir) && isDir[0];
}

// Return display name of file, minus path
// file: a Path object
function getFileDisplayedName(file) {
    var alias = SystemEvents.aliases.byName(file);
    return alias.displayedName();
}

// Add an error message to the list of messages to display at the end
// errorMessage: a text string message
function addError(errorMessage) {
    errorMessages.push(errorMessage);
}

// Display a message dialog
// title: title text
// informationalText: optional body of message
function alert(title, informationalText) {
    //console.log(title, ": ", Automation.getDisplayString(informationalText));
    var options = { };
    if (informationalText) options.message = informationalText;
    app.displayAlert(title, options);
}