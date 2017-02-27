#!/bin/bash

#
# This bash script sets the EXIF 'date taken' for a directory of images.
# The directory structure must be like this:  /Some/Path/To/Photos/2001/12-31
# It looks at the directory names and figures out what the date should be from that.
#
# THERE IS NO ERROR CHECKING: 
# 1) If the directory structure isn't exactly that, it will still attempt to set the EXIF metadata.
# 2) If filenames have spaces, it will mess up.
# 3) If files do not end in lowercase *.jpg, it won't find them.
#

#
# From the current directory, parse out the year, month and day.
# The directory structure must be something like this:
# /Some/Path/To/Photos/2001/12-31
#

# For more info on BASH's % and # string manipulators:
# http://tldp.org/LDP/abs/html/refcards.html#AEN22664

# parentdir will be /absolute/path/to/grandparent
# Will be something like this: /Some/Path/To/Photos/2001
parentdir="${PWD%/*}"
#echo "parentdir: $parentdir"

#year will be something like "2001"
year="${parentdir##*/}"
#echo "year: $year"

#monthday will be something like "12-31"
monthday=${PWD##*/}
#echo "monthday: $monthday"

# month will be something like "12"
month=${monthday%-*}
#echo "month: $month"

# day will be something like "31"
day=${monthday#*-}
#echo "day: $day"

#
# Loop through all the jpgs in the directory,
# This only gets the exact extension 'jpg'; 
# it will **NOT** get uppercase *.JPG or *.jpeg files.
#

EXT=jpg
# For all files in directory
for i in *; do
	# If file ends in .jpg
    if [ "${i}" != "${i%.${EXT}}" ];then
		# We have an image file; process it.
		photoFilename=$i
		
		#echo "photoFilename: $photoFilename"
		
		# From the image's EXIF data, get the capture date aka date taken.
		# This requires the exiftool 3rd party library to be installed.
		currentExifDate=$(exiftool -s3 -datetimeoriginal $photoFilename)
		#echo "currentexifdate: $currentexifdate"
		
		# The EXIF date is of format 2001:12:31 11:59:59
		# To make it easier to parse, substitute : for ' ' so it becomes
		# 2001 12 31 11 59 59
		currentExifDateWithSpaces=${currentExifDate//[:]/ }
		#echo "currentExifDateWithSpaces: $currentExifDateWithSpaces"
		
		# Create array of date parts by splitting on spaces
		currentExifDateArr=($currentExifDateWithSpaces)
		currentExifYear=${currentExifDateArr[0]}
		currentExifMonth=${currentExifDateArr[1]}
		currentExifDay=${currentExifDateArr[2]}
		#echo "currentExifYear: $currentExifYear"
		#echo "currentExifMonth: $currentExifMonth"

		# If the photo's year is the same as the directory structure,
		# don't do anything.
		if [ "${currentExifYear}" == "${year}" ] && [ "${currentExifMonth}" == "${month}" ];then
			# If the year and month are correct
			echo "Year & month matches -- everything is cool with $photoFilename"
		else
			# If the year or month not correct...
			echo "$currentExifYear/$currentExifMonth/$currentExifDay isn't correct for: $photoFilename"

			#
			# Update the EXIF date
			#
			
			# Create the EXIF datestring of format 2001:12:31 11:59:59
			newExifDate="$year:$month:$day 00:00:00"
			#echo "newExifDate: $newExifDate"
			
			# Set new EXIF date on image file
			#
			# UNCOMMENT THE FOLLOWING LINE TO SET THE EXIF date
			#######exiftool -overwrite_original_in_place -AllDates="$newExifDate" $photoFilename
			#
			
			#
			# Update the filesystem dateCreated
			#
			
			# It's of format YYYYMMDDhhmm
			# 2001/12/31 00:00 would be 200112310000 
			hhmm='0000'
			dateCreatedString="$year$month$day$hhmm"
			#echo "dateCreatedString: $dateCreatedString"
			
			# UNCOMMENT THE FOLLOWING LINE TO SET THE FILE'S DATE CREATED & MODIFIED
			#######touch -t $dateCreatedString $photoFilename
			#
		fi
    fi
done