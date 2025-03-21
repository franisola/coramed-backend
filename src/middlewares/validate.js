export const authNotRequired = (req, res, next) => {
	const { token } = req.cookies;


	if (token) return res.status(401).json({ message: 'Authorization denied' });

	next();
};
