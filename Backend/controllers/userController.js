exports.getProfile = async (req, res) => {
    res.status(200).json(req.user);
  };
  
  exports.updateProfile = async (req, res) => {
    const { name, email, role } = req.body;
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, email, role },
        { new: true }
      );
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  