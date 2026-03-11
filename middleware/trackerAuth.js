const trackerAuth = (req, res, next) => {

  try {

    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Tracker authentication failed"
      });
    }

    next();

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Tracker validation error"
    });
  }

};

module.exports = trackerAuth;