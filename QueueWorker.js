/**
 * @name QueueWorker.js
 * @description RaidManager3 Scheduling Queue worker
 * @package RaidManager4
 * @author imskyyc
 */

const MySQL = require("mysql2/promise");
const Bluebird = require("bluebird");
const Time = Math.floor(new Date().getTime() / 1000);
const FileSystem = require("fs");
const Environment = require("toml").parse(
  FileSystem.readFileSync(`${__dirname}/.config/app.toml`)
);
const { exec } = require("child_process");

// Main async thread
(async () => {
  // Initialize database
  const returned = await exec(`/usr/bin/node ${__dirname}/raidmanager db:init`, async (stderr, stdout) => {
    if (stderr) {
      process.stderr.write(stderr.message);
    } else {
      const Connection = await MySQL.createConnection({
        host: Environment.database.host,
        user: Environment.database.user,
        password: Environment.database.pass,
        database: Environment.database.base,
        Promise: Bluebird,
      });
    
      // Query the database for all the events in the schedule.
      const [Result] = await Connection.query("SELECT * FROM schedule");
    
      // Iterate through every event.
      for (const Index in Result) {
        const Event = Result[Index];
        const EventDate = Event.date;
        const EventLength = Event.length;
    
        // Check if the event is over by adding it's date + Event Length (minutes) * 60 (60 seconds / min)
        if (Time + EventLength * 60 >= EventDate) {
          // If the EventDate is less than or equal to the current time + the above math ^, delete the event.
          const [Deleted] = await Connection.query(
            "DELETE FROM schedule WHERE id=?",
            [Event.id]
          );
    
          // If the database affected more than one row, continue the loop, else it errored and we can break out.
          if (Deleted.affectedRows > 0) {
            continue;
          } else {
            break;
          }
        }
      }
    
      // End the connection to avoid a hanging thread.
      Connection.end();
    }
  });
})();
