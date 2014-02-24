# Reaction Time Tracker UI

This adds a browser based user interface to Seth Roberts' (http://blog.sethroberts.net) reaction time tracking software.

---
### Steps to install 

- First, install R from http://www.r-project.org

- Open your workspace Rdata file (from Seth) into R.

- To install the UI into your R workspace, type these commands into the R console.

    	library(devtools)
    	library(opencpu)
    	install_github("braintracker", "jetpad")
    	library(braintracker)
    	
### Steps to run

- Type this command into the R console to start the application in your browser.
	
		opencpu$browse("/library/braintracker/www")

---
## Supported Browsers 
(This is limited by angular-bootstrap)

  - Chrome (stable and canary channel)
  - Firefox
  - IE 9 and 10
  - Opera
  - Safari


----------------------------------
Problems with the installation? Then try running:

    install.packages("devtools")
    install.packages("opencpu")
    install_github("braintracker", "jetpad")
    library(braintracker)
    library(opencpu)

