const mongoose = require("mongoose");

const User = require("../../models/people");
const Settings = require("../../models/settings");

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

			let emailText = (await Settings.findOne({})).reminderMessage.replace(
				/{{name}}/g,
				user.firstName
			);
			const emailSubject = emailText.split("\n")[0];
			emailText = emailText
				.split("\n")
				.filter((_, index) => index !== 0)
				.join("\n");

			// if the user has provided whatsapp number then we will send a whatsApp message otherwise
			// email will be sent
			// if (user.phone) {
			// } else {
			await transporter.sendMail({
				from: `EDconsulting<${process.env.EMAIL}>`,
				to: user.email,
				subject: emailSubject,
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
