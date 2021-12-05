const MongoClient = require("mongodb").MongoClient;

module.exports = function (agenda) {
	agenda.define("after21days", (job, done) => {
		const client = new MongoClient(process.env.MONGO_URL);

		client.connect((err) => {
			if (!err) {
				const db = client.db("educational-site");
				const { userId, question, category } = job.attrs.data;
			} else {
				console.log(err.message || err);
				client.close();
				done();
			}
		});
	});
};
