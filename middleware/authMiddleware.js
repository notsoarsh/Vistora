module.exports = (req, res, next) => {
  // Check if user is logged in by verifying session
  if (req.session && req.session.userId) {
    // User is logged in, proceed to the next middleware or route handler
    return next()
  }
  // User is not logged in, redirect to the login page with a message
  res.redirect("/login?message=Please login to continue")
}
