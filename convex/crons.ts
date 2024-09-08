import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
 "delete any old files marked for deletion",
 { hourUTC: 23, minuteUTC: 0 }, // Every day at 8:00am PST
 internal.files.deleteAllFiles
);

// crons.monthly(
//   "payment reminder",
//   { day: 1, hourUTC: 16, minuteUTC: 0 }, // Every month on the first day at 8:00am PST
//   internal.payments.sendPaymentEmail,
//   { email: "my_email@gmail.com" }, // argument to sendPaymentEmail
// );

export default crons;
