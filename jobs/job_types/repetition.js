const MongoClient = require("mongodb").MongoClient;

const Question = require("../../models/question");

module.exports = function (agenda) {
	agenda.define("repetition", (job, done) => {
		const client = new MongoClient(process.env.MONGO_URL);

		client.connect(async (err) => {
			if (!err) {
				const db = client.db("educational-site");
				const { userId, question: questionId } = job.attrs.data;

				if (!userId || !questionId) {
					done();
					client.close();
				}

				try {
					const user = await db.collection("peoples").findOne({ _id: userId });
					const question = await Question.findOne({ _id: questionId });

					// show the question to the user again in the checking phase
					await Question.updateOne({ _id: questionId }, { $pull: { knownUsers: user._id } });
					await Question.updateOne({ _id: questionId }, { $pull: { unknownUsers: user._id } });
					await Question.updateOne({ _id: questionId }, { $pull: { packUsers: user._id } });

					client.close();
					done();
				} catch (err) {
					console.log(err.message || err);
				}
			} else {
				console.log(err.message || err);
				client.close();
				done();
			}
		});
	});
};
