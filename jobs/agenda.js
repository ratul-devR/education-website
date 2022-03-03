const Agenda = require("agenda");

const dbUrl = process.env.MONGO_URL;
const agenda = new Agenda({
	db: { address: dbUrl, collection: "jobs" },
});

const jobTypes = ["repetition", "sendWAMessage"];

jobTypes.forEach((type) => {
	require("./job_types/" + type)(agenda);
});

if (jobTypes.length) {
	agenda.on("ready", async () => await agenda.start());
}

const graceFul = () => agenda.stop(() => process.exit(0));

process.on("SIGTERM", graceFul);
process.on("SIGINT", graceFul);

module.exports = agenda;
