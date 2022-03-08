const mongoose = require("mongoose");

const User = require("../../models/people");
const Settings = require("../../models/settings")

const transporter = require("../../utils/emailTransporter");

module.exports = (agenda) => {
	agenda.define("sendWAMessage", async (job, done) => {
		await mongoose.connect(process.env.MONGO_URL);

		const { userId } = job.attrs.data;

		try {
			const user = await User.findOneAndUpdate({ _id: userId }, { loginRequired: true });

			if (!user) {
				done();
				return;
			}

			if (user.role === "admin") {
				user.loginRequired = false;
				await user.save();
				done();
				return;
			}

			const emailText = (await Settings.findOne({})).reminderMessage

			// if the user has provided whatsapp number then we will send a whatsApp message otherwise
			// email will be sent
			// if (user.phone) {
			// } else {
			await transporter.sendMail({
				from: `EDconsulting<${process.env.EMAIL}>`,
				to: user.email,
				subject: "Login reminder",
				text: emailText,
			});
			// }
			done();
		} catch (err) {
			console.log(err);
			done();
		}
	});
};
