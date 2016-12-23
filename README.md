# image-dater
A perl script to set photos' creation dates correctly.

This script sets:
 - Photos' EXIF / IPTC capture date
 - Photos' file create date
 
Finds the correct date by looking the image's folder structure, like: /2010/12-31/photo.jpg

I'm using perl because I want to use the excellent perl library ExifTool by Phil Harvey: http://www.sno.phy.queensu.ca/~phil/exiftool/

YOU MUST INSTALL ExifTool AS A PREREQUISITE.  I last tested this with Mac OSX 10.12.2.