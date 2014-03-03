#TODO and Misc. Notes

- Immediate Steps
	- Add support to load/save data file from dropbox
	- Remove opencpu
	- Create an "import" in R to get the raw data into Seth's program
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
