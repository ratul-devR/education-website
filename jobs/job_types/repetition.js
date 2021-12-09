const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("mongoose").Types;

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

					// let's check if the question already exists in his questions list
					let questionExists = false;
					for (let i = 0; i < user.questions.length; i++) {
						const question = user.questions[i];
						if (question.toString() == questionId.toString()) {
							questionExists = true;
						}
					}

					if (!questionExists) {
						await db.collection("peoples").updateOne(
							{ _id: userId },
							{
								$push: { questions: ObjectId(questionId) },
							}
						);
					}
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
