#TODO 

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
