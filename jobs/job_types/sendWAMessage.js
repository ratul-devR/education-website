const mongoose = require("mongoose");

const User = require("../../models/people");

const transporter = require("../../utils/emailTransporter");

module.exports = (agenda) => {
	agenda.define("sendWAMessage", async (job, done) => {
		await mongoose.connect(process.env.MONGO_URL);

		const { userId } = job.attrs.data;

		if (!userId) {
			done();
			return;
		}

		const user = await User.findOneAndUpdate({ _id: userId }, { loginRequired: true });
		if (user.role === "admin") {
			user.loginRequired = false;
			await user.save();
		}

		if (!user) {
			done();
			return;
		}

		// if the user has provided whatsapp number then we will send a whatsApp message otherwise
		// email will be sent
		// if (user.phone) {
		// } else {
			await transporter.sendMail({
				from: `${process.env.EMAIL}`,
				to: user.email,
				subject: "Hey there please login again",
				text: "In order to continue, you have to login",
			});
		// }
	});
};
