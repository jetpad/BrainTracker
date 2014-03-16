#TODO and Misc. Notes

- Upon importing or saving a session, calculate the mean and save it as part of the session, NO

- Show a progress bar for the loading of the main dataset. 


- ANOVA to compare the means of each session?

- Combine trials from existing sessions when reading from the databse
	- Do just a basic fetch of the session records
	- Create a trials structure, iterate through the sesssions and populate the trials
	- Create a report page to view things
5- Add any additional sessions that come in
- Show the session list in a report
- Show the trials for a session in a report. 
- Progress bar for a session that grows 
	- from the center left (red) to reflect a lower than 50% tile
	- from the center right (green) to reflect a higher than 50% tile
	- updated dynamically as the session progresses
	- ptile of last trial is somehow also displayed on that bar 
- Create place for user to enter notes about the session. 
- When get to max "included" trials then save the session and go to the "finished" page. 
- Try to add the "latency" of the last trial to the end time of the session. 
- Remove "Save" button. 
- Fix the dropbox.js unit test

- Register datastorebrowser.com and create a generic site for browsing datastores of information. 

- Allow user to create a "study"
	- Select length of time for the study (ie 1 Week, A for 1 week followed by B for a week, break inbetween?)
	- Show calendar/chart of the overlap of the study on the reaction time data including future time.
	- Create a chart/run statistics that compare the two timeperiods for you. 

- Keep the trial data together in a single string
- Add an array of those strings to the sesion record
- When one datastore fills up, create a new one to use
- When starting up, pull the records out of all the datasets into memory. 
- Treat the last (non-full) dataset as special. 

- Calculate the latency for the session and save it during import/save session. 
- Remove the precalculated ptile from the trial. 


- Export the whole thing out as JSON.

- Storage Space
	- Original two tables (300 sessions)
	- Combined into one table (2000 sessions)
		- Replace true/false with 1/0 to make smaller
		- Or maybe leave out false values 
	- Combined into one table with shortened field names in the trials (3000 sessions)
	- Combined into one file with full names (2500 sessions)

	- Don't keep individual trials around
		- probably will hit the 10k session limit

	- R tasks
		- analyse how he calculates ptile for during 
			- small ptile is your overall ptile score for the current session (determined on the fly.)
			- large ptile is the ptile of the trial just finished (determined on the fly).

- Q's for dropbox
	- Is non-minimized version of Datastore js file available? 

- To export from R
	- write.csv(file="ReactionTime.csv", x=newmath5)

- Alternative for dropbox integration https://github.com/christiansmith/ngDropbox

- Immediate Steps

	- Multiple datastores? 
	- Just store it in a file? 

	- Display a process bar for the background import 
	- move it to an "import" page. 
	- Add text to explain things
	- Do the header check. 
	- Add a "report" to look at the data. 

	- Dropbox
		- Import,{"error": "Invalid delta: delta size cannot exceed 2097152 bytes; observed size: 4322868"}
			- What is the best way to import into smaller chunks since we don't control when it syncs. 
		- Size of the field names effects overall size and limits (stored for each record)
		- Transactions, what if crash during import or ? 
		- 

	- Breakup the dbservice.js test into individual small test files and put them in a dbservice subdirectory

	- Create and select a "TESTING" datastore for running unit tests

	- copy main.js to save it.
	- have main.js alias the dbservice functions
	- if that works then move some of the aliased calls into the main page and get rid of aliases
	- create a group of dbService tests
		- refresh authorization
		- signout
		- make sure signed out
		- refresh authorization
		- make sure signed in
		- open/access datastore
	- have dbService open up the default datastore

	- Add support to load/save data file from dropbox
	- Create an "import" in R to get the raw data into Seth's program

	- Record test type id and test version number in each session. 

- Following Steps
	- Integrate the gauss javascript library
	- Integrate NVD3.js and D3.js to do the charting 
	- Create a grunt action that'll publish the site to a shared dropbox folder(?)

- Add an app version number to each trial recorded to help watch for changes caused by the app and not diet/lifestyle

- Package addons for Seth's R script into a library that can be loaded with install_github()
	- Import/export
	- Put things (as much as possible) onto a single menu
		- Q
		- Test
		- Warmup
		- Export
		- Import
		- Graphs

- Data Structures
	- User Settings
	- Sessions
		- sessionkey   X
		- description  X
		- starttime    X
		- endtime      X
		- durationmsec X
		- min Latency  X
		- max Latency  X
		- Time Waited  X
		- Trials       X
	- Trials ~50 bytes
		- 8 sessionkey    X
		- 8 trial (1-32)  X
		- 4 problem       X
		- 4 answer        X 
		- 8 latencymsec   X 
		- 8 latencyptile  X
		- 1 include T/F      X
		- 1 correction T/F   X
		- 1 warmup T/F       X
		- 1 correct T/F      X
		- 10 notes           X

- Automate starting and linking R server to the development environment
	- Some sort of grunt command to start up the server? 
	- include special url in javascript (development) environment

- Switch to using a different statistics package
	- Gauss for javascript?
	- D3.js although it really is more of a graphing package. 
	- NVD3.js for charts

- opencpu session id
	- Save the session after the first call
	- Need to pass the session id on every subsequent call so that it can get to the responseTrials data
	- Check for "Hey, thats not a valid session id" error and that'll mean time to reload responseTrials data

- Find a way to generate man pages from markdown

- How to get the path to the rdata file? 
	- User enters path directly
	- Access via Dropbox or Google Drive
	- User drags and drops the local file onto a drop area

- Make sure I can get dates to and from R from javascript 
https://www.opencpu.org/posts/jsonlite-a-smarter-json-encoder/

- Create UI for onscreen and hotkey session options
	- Cancel last trial
	- End Session
	- Save (enabled after 32 trials have been completed)
	- Quit
	- Center alight the button group

- Running average should not include correction trials
- Enabled the save button when 32 succesful trials are taken. 
- Cancel last trial
- End Session Button
	- resets trials and sets trial count back to 0

- Display 'ptile' on the screen for each trial
- Track the total elapsed session time to display at the end of the session. 

- Recognize 32 trials succesfully run
	- Display length of session on screen and prompt to save. 

# Steps to link to R
- Call a saveSession stub
	- make it actually save the data
- Call a saveWorkspace stub
	- make it actually save the workspace (does that actually work?) after saving each session. 
- Call a displayChart stub
	- make it actually display a chart
	- Add parameter for the chart type
	- Add parameter for the number of sessions
	- Add other parameters

- Get Karma shell working
- Write a base jasmine test of a reactionSession/reactionTrial components
- Unit test filling up some trial objects to complete a session

---
### DATES
	- http://stackoverflow.com/questions/15838548/parsing-iso8601-date-and-time-format-in-
	- http://stackoverflow.com/questions/10699511/difference-between-as-posixct-as-posixlt-and-strptime-for-converting-character-v
	- https://github.com/jeroenooms/jsonlite/issues/8
	- http://stat.ethz.ch/R-manual/R-patched/library/base/html/strptime.html
	- https://www.opencpu.org/posts/jsonlite-a-smarter-json-encoder/
	- https://stat.ethz.ch/R-manual/R-devel/library/base/html/difftime.html

---
### Later things and Brainstorming

- Also put matching copy of javascript files on the local server
- Use http://rcharts.io for charts?
- Show pain picture, fire, hot, or sharp things to help with the response time. 
- figure out how to generate r man pages
- Add unit tests / test cases for angular
- Add unit tests / test cases for r package
- http://extendbootstrap.com

---
### Authorization
- http://blog.auth0.com/2014/01/07/angularjs-authentication-with-cookies-vs-token/
- OAuth.io for authorization? 
	- https://github.com/jeroenooms/opencpu-legacy/blob/master/R/login.R

---
### Main UI sections

- Options available from main screen	
	- Display **Charts**
	- **Begin** trial
	- **Warmup** 
	- **Save** the complete session to the workspace.
- Options available during trial taking
	- **End** the current session without saving it.
	- **Cancel** the last trial. 
- Options available during a trial warmup period
    - **Begin** trial
- Options available during a single session of a trial
	- **Clicking/touching** the "green" target.
	- **Cancel** the last trial
	- **End** the current session
