.onLoad <- function(lib, pkg){

  Sys.setenv(TRACKER_FILE=paste( getwd(), "/ResponseTrials.Rdata" ) )	  
  #Makes sure methods is loaded, which should always be the case
  #This is needed for R CMD CHECK only... looks like a bug?
  #See Uwe @ https://stat.ethz.ch/pipermail/r-devel/2011-October/062261.html
  eval(call("require", "methods", quietly=TRUE))
}