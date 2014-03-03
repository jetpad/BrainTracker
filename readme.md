# Reaction Time Tracker UI

This adds a browser based user interface to Seth Roberts' (http://blog.sethroberts.net) reaction time tracking software.

This applications lets you track your reaction speed over time. Reaction speed is an indicator of the health of your brain and by proxy, the health of your whole body. Using this application will let you see how diet and lifestyle changes effect your health.

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
### Problems with the installation? then try typing these commands into the R console:

    install.packages("devtools")
    install.packages("opencpu")
    install_github("braintracker", "jetpad")
    library(braintracker)
    library(opencpu)


----------------------------------
### For developers working this package

    Open the braintracker.Rproj file.
    
    After making changes to the R source, do this to refresh the code in R

      remove.packages("braintracker")
      install.packages(".", repos = NULL, type="source")
      library(opencpu)
      braintracker::startup()



