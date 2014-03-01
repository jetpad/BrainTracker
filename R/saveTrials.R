#' saveTrials
#' 
#' Takes an array of trials and saves them to the workspace. 
#' 
saveTrials<- function(trials = ""){
  if(trials == ""){
    stop("Give me your trials data!")
  }

  beforels = ls()

  reactionTrials <- load('/Users/davidsmith/Sites/braintracker/davidsbraintest.RData')

  afterls = ls()

  jsonSessionData0 = trials
  jsonSessionData1 <- trials
  jsonSessionData2 <<- trials
  assign("jsonSessionData3", trials, envir = .GlobalEnv)
 # sessionData <- jsonlite::fromJSON(trials)

  list(
    result = TRUE,
    trials = trials,
    files = list.files(),
    getwd = getwd(),
    beforels = beforels,
    afterls = afterls,
    trackerfile = Sys.getenv("TRACKER_FILE"),
    rhome = R.home(),
    homefile = list.files(R.home())
  )
}