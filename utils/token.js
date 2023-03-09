const {sign} = require("jsonwebtoken");

const createTokensAdmin = (user) => {
	const accessToken = sign(
		{ username: user },
		process.env.JWT_SECRET_KEY,
		{ expiresIn: process.env.JWT_EXPIRE }
	);
	return accessToken
};

module.exports = {createTokensAdmin};
