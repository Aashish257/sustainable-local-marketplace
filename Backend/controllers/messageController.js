const Message = require('../models/Messages');

exports.sendMessage = async (req, res) => {
  const { receiver, message } = req.body;

  try {
    const newMsg = await Message.create({
      sender: req.user._id,
      receiver,
      message,
    });

    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getConversation = async (req, res) => {
  const userId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
