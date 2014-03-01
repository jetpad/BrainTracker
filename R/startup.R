#' start
#' 
#' startup the braintracker server
#' 
startup <- function(){
	opencpu$stop()
	opencpu$start(12345)
}

##.onLoad <- function(libname = find.package("braintracker"), pkgname = "braintracker") {
##	startup()
##}