#' loadReactionTrials
#' 
#' Loads the Rdata file containing all the reaction trials. 
#' 
loadReactionTrials <- function(){

  reactionTrials <- load('/Users/davidsmith/Sites/braintracker/davidsbraintest.RData')

  list(
    result = TRUE
  )
}