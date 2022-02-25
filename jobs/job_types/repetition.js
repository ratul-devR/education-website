const mongoose = require("mongoose");

const Question = require("../../models/question");
const User = require("../../models/people");

const transporter = require("../../utils/emailTransporter");

module.exports = function (agenda) {
	agenda.define("repetition", async (job, done) => {
		await mongoose.connect(process.env.MONGO_URL);

		const { userId, questions } = job.attrs.data;

		if (!userId || (!questions && !questions.length)) {
			done();
		}

		try {
			const user = await User.findOne({ _id: userId });

			// show the question again to the user in checking phase
			await Question.updateMany({ $in: questions }, { $pull: { knownUsers: user._id } });
			await Question.updateMany({ $in: questions }, { $pull: { unknownUsers: user._id } });
			await Question.updateMany({ $in: questions }, { $pull: { packUsers: user._id } });

			// mark the user as repeated
			await Question.updateMany({ $in: questions }, { $push: { repeatedUsers: user._id } });

			// after all send the user a reminder about it through mail
			await transporter.sendMail({
				from: `${process.env.EMAIL}`,
				to: user.email,
				subject: "It's time for spaced repetition",
				text: "Hey it's time to check the words which you recently learned",
			});

			done();
		} catch (err) {
			console.log(err.message || err);
		}
	});
};
