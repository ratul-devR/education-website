const mongoose = require("mongoose");

const User = require("../../models/people");

const transporter = require("../../utils/emailTransporter");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require("twilio")(accountSid, authToken);

module.exports = (agenda) => {
	agenda.define("sendWAMessage", async (job, done) => {
		await mongoose.connect(process.env.MONGO_URL);

		const { userId } = job.attrs.data;

		if (!userId) {
			done();
			return;
		}

		const user = await User.findOneAndUpdate({ _id: userId }, { loginRequired: true });

		if (!user) {
			done();
			return;
		}

		// if the user has provided whatsapp number then we will send a whatsApp message otherwise
		// email will be sent
		if (user.phone) {
			twilio.messages
				.create({
					body: "Hi, please login again to continue",
					from: process.env.TWILIO_WA_PHONE_NUMBER,
					to: `whatsapp:${user.phone}`,
				})
				.catch((err) => console.log(err.message))
				.done();
		} else {
			await transporter.sendMail({
				from: `${process.env.EMAIL}`,
				to: user.email,
				subject: "Hey there please login again",
				text: "In order to continue, you have to login",
			});
		}
	});
};
