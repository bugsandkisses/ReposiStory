roseX <- function(theta, a, n, d) {
  k <- n/d
  return(a*cos(k*theta)*cos(theta))
}
roseY <- function(theta, a, n, d) {
  k <- n/d
  return(a*sin(k*theta)*cos(theta))
}
rose <- function(a=1, n=1, d=1) {
  #' Cartesian coordinates for rose
  #'
  #' @param a Scale factor, radius of rose.
  #' @param n
  #' @param d
  #'
  #' @references Rose (mathematics), https://en.m.wikipedia.org/wiki/Rose_(mathematics)
  theta <- seq(-d*pi, d*pi, length.out = 1000)
  x <- roseX(theta, a, n, d)
  y <- roseY(theta, a, n, d)
  return(matrix(c(x, y), ncol = 2))
}





xy <- rose(a = 1, n = 2, d = 7)

# png("rose.png", family = "mono")
par(mar = c(3, 1, 5, 1) + 0.1,
    cex.main = 1.5,
    bg = "#000000", col.main = "#fa1141")
plot(xy,
     asp = 1, axes = FALSE,
     xlab = "", ylab = "",
     xlim = range(xy[,1]),
     ylim = range(xy[,2]),
     main = "Rose\nr = a*cos(k*theta)",
     col = "#fa1141", pch = 23)
# dev.off()