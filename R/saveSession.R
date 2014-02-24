#' Save Session
#' 
#' Saves a single session worth of data to the R workspace.
#' 
#' @export
#' @param thesessiondata the data for a single session. Required.
saveSession <- function(thesessiondata = ""){
  if(thesessiondata == ""){
    stop("Give me the session data")
  }
  list(
    message = paste("Session data: ", thesessiondata, "  R Version:", R.Version()$version.string)
  )
}