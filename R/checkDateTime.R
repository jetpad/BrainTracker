#' checkDateTime
#' 
#' send a date to opencpu server and see if it is the same when returned. 
#' 
checkDateTime <- function(datetime = ""){
  if(datetime == ""){
    stop("Tell me your date and time!")
  }
  else
  {
  	rdatetime = datetime
  	mysystime = Sys.time()
  }
  list(
    message = paste("Your dateTime was ", datetime ),
    mysystime = mysystime,
    mytimestring = as.character(mysystime),
    datetime = rdatetime,
    monkey = "WHO????"
  )
}
