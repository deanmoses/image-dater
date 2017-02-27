# redate.sh
A BASH shell script to set photos' creation dates correctly.  Only tested on Mac OSX.

This script sets:
 - Photos' EXIF / IPTC capture date
 - Photos' file create date
 
Finds the correct date by looking the image's folder structure, like: /2010/12-31/photo.jpg

Prerequisite: you must install the excellent perl library ExifTool by Phil Harvey: http://www.sno.phy.queensu.ca/~phil/exiftool/

Last tested with Mac OSX 10.12.2.

# checker.js
Apple OS X shell script written in javascript to check Tacocat image files before publicaction.

Recursively processes a set of folders.  Displays message if any file doesn NOT meet criteria for publishing to tacocat, such as:
 - not being a *.jpg
 - not having an Exif date captured
 
 Last tested with Mac OSX 10.12.2.
