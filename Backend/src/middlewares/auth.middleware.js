const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "You must be logged in to vote" });
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'votre_cle_secrete_super_securisee';
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id || decoded.userId || decoded._id || decoded.sub;

    if (!userId) {
      return res.status(401).json({ message: "You must be logged in to vote" });
    }
    req.user = { id: userId, email: decoded.email };
    req.userId = userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "You must be logged in to vote" });
  }
};