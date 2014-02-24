\name{example}
       \alias{example}
       \title{example title}
       \description{
         Example description. 
         \code{save}.
       }
       \usage{
       load(file, envir = parent.frame())
       }
       \arguments{
         \item{file}{a connection or a character string giving the
           name of the file to load.}
         \item{envir}{the environment where the data should be
           loaded.}
} \seealso{
         \code{\link{save}}.
       }
       \examples{
       ## save all data
       save(list = ls(), file= "all.RData")
       ## restore the saved values to the current environment
       load("all.RData")
       ## restore the saved values to the workspace
       load("all.RData", .GlobalEnv)
       }
       \keyword{file}