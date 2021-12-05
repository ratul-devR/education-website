const Agenda = require("agenda");

const dbUrl = process.env.MONGO_URL;
const agenda = new Agenda({ db: { address: dbUrl, collection: "jobs" } });

const jobTypes = ["after1day", "after7days", "after21days"];

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
