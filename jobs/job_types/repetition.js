const mongoose = require("mongoose");

const Question = require("../../models/question");
const User = require("../../models/people");

module.exports = function (agenda) {
	agenda.define("repetition", async (job, done) => {
		await mongoose.connect(process.env.MONGO_URL);

		const { userId, question: questionId } = job.attrs.data;

		if (!userId || !questionId) {
			done();
		}

		try {
			const user = await User.findOne({ _id: userId });

			// show the question to the user again in the checking phase
			await Question.updateOne({ _id: questionId }, { $pull: { knownUsers: user._id } });
			await Question.updateOne({ _id: questionId }, { $pull: { unknownUsers: user._id } });
			await Question.updateOne({ _id: questionId }, { $pull: { packUsers: user._id } });

			done();
		} catch (err) {
			console.log(err.message || err);
		}
	});
};
