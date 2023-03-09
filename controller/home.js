
const getError403 = (req, res, next) => {
	res.render("error403");
};

const getError404 = (req, res, next) => {
	res.render("error404");
};

module.exports = {getError404,getError403}