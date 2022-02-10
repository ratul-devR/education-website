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
			const question = await Question.findOne({ _id: questionId });

			// show the question to the user again in the checking phase
			await Question.updateOne({ _id: questionId }, { $pull: { knownUsers: user._id } });
			await Question.updateOne({ _id: questionId }, { $pull: { unknownUsers: user._id } });
			await Question.updateOne({ _id: questionId }, { $pull: { packUsers: user._id } });

			question.repeatedUsers = question.repeatedUsers.map((user) => user.toString());
			const alreadyRepeated = question.repeatedUsers.includes(userId.toString());

			if (!alreadyRepeated) {
				await Question.updateOne({ _id: questionId }, { $push: { repeatedUsers: userId } });
			}

			done();
		} catch (err) {
			console.log(err.message || err);
		}
	});
};
