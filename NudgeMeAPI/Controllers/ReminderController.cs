using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace RemindersApi.Controllers
{
    [ApiController]
    [Route("[controller]")]

    public class ReminderController : ControllerBase
    {
        private readonly string _connectionString;

        public ReminderController(IConfiguration configuration)
        {
            // Read from environment variables
            var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "nudgeme-postgresql";
            var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
            var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "nudgeme";
            var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "nudgemepass";
            var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "nudgeme";
            
            _connectionString = $"Host={dbHost};Port={dbPort};Username={dbUser};Password={dbPassword};Database={dbName}";
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var reminders = new List<Reminder>();
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();
            
            // Create table if not exists
            using (var cmd = connection.CreateCommand())
            {
                cmd.CommandText = @"
                    CREATE TABLE IF NOT EXISTS reminders (
                        id SERIAL PRIMARY KEY,
                        info TEXT NOT NULL,
                        createdDate TIMESTAMP NOT NULL,
                        nextReminder TIMESTAMP NOT NULL,
                        snooze BOOLEAN NOT NULL DEFAULT false
                    )";
                cmd.ExecuteNonQuery();
            }

            using var selectCmd = connection.CreateCommand();
            selectCmd.CommandText = "SELECT id, info, createdDate, nextReminder, snooze FROM reminders ORDER BY id";
            using var reader = selectCmd.ExecuteReader();
            while (reader.Read())
            {
                reminders.Add(new Reminder
                {
                    Id = reader.GetInt32(0),
                    Info = reader.GetString(1),
                    CreatedDate = reader.GetDateTime(2),
                    NextReminder = reader.GetDateTime(3),
                    Snooze = reader.GetBoolean(4)
                });
            }
            return Ok(reminders);
        }

        [HttpGet("Nudge/{id}")]
        public IActionResult GetById(int id)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();
            
            using var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT id, info, createdDate, nextReminder, snooze FROM reminders WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", id);
            
            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                var reminder = new Reminder
                {
                    Id = reader.GetInt32(0),
                    Info = reader.GetString(1),
                    CreatedDate = reader.GetDateTime(2),
                    NextReminder = reader.GetDateTime(3),
                    Snooze = reader.GetBoolean(4)
                };
                return Ok(reminder);
            }
            
            return NotFound();
        }

        [HttpPost]
        public IActionResult Create([FromBody] Reminder reminder)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();
            
            using var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO reminders (info, createdDate, nextReminder, snooze) 
                VALUES (@info, @createdDate, @nextReminder, @snooze)";
            cmd.Parameters.AddWithValue("@info", reminder.Info);
            cmd.Parameters.AddWithValue("@createdDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@nextReminder", reminder.NextReminder);
            cmd.Parameters.AddWithValue("@snooze", reminder.Snooze);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Reminder reminder)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();
            
            using var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                UPDATE reminders 
                SET info = @info, createdDate = @createdDate, nextReminder = @nextReminder, snooze = @snooze 
                WHERE id = @id";
            cmd.Parameters.AddWithValue("@info", reminder.Info);
            cmd.Parameters.AddWithValue("@createdDate", reminder.CreatedDate);
            cmd.Parameters.AddWithValue("@nextReminder", reminder.NextReminder);
            cmd.Parameters.AddWithValue("@snooze", reminder.Snooze);
            cmd.Parameters.AddWithValue("@id", id);
            var rows = cmd.ExecuteNonQuery();
            if (rows == 0) return NotFound();
            return Ok();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();
            
            using var cmd = connection.CreateCommand();
            cmd.CommandText = "DELETE FROM reminders WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", id);
            var rows = cmd.ExecuteNonQuery();
            if (rows == 0) return NotFound();
            return Ok();
        }

        [HttpPatch("{id}/snooze")]
        public IActionResult UpdateSnooze(int id, [FromBody] SnoozeRequest request)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();
            
            using var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                UPDATE reminders 
                SET snooze = @snooze 
                WHERE id = @id";
            cmd.Parameters.AddWithValue("@snooze", request.Snooze);
            cmd.Parameters.AddWithValue("@id", id);
            var rows = cmd.ExecuteNonQuery();
            if (rows == 0) return NotFound();
            return Ok();
        }
    }
}
