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
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? "Host=postgresql;Port=5432;Username=nudgeme;Password=nudgemepass;Database=nudgeme";
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
                        lastReminded TIMESTAMP,
                        gapmins BIGINT NOT NULL
                    )";
                cmd.ExecuteNonQuery();
            }

            using var selectCmd = connection.CreateCommand();
            selectCmd.CommandText = "SELECT id, info, createdDate, lastReminded, gapmins FROM reminders ORDER BY id";
            using var reader = selectCmd.ExecuteReader();
            while (reader.Read())
            {
                reminders.Add(new Reminder
                {
                    Id = reader.GetInt32(0),
                    Info = reader.GetString(1),
                    CreatedDate = reader.GetDateTime(2),
                    LastReminded = reader.IsDBNull(3) ? (DateTime?)null : reader.GetDateTime(3),
                    Gap = TimeSpan.FromSeconds(reader.GetInt64(4))
                });
            }
            return Ok(reminders);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Reminder reminder)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();
            
            using var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO reminders (info, createdDate, lastReminded, gapmins) 
                VALUES (@info, @createdDate, @lastReminded, @gapmins)";
            cmd.Parameters.AddWithValue("@info", reminder.Info);
            cmd.Parameters.AddWithValue("@createdDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@lastReminded", DBNull.Value);
            cmd.Parameters.AddWithValue("@gapmins", (long)reminder.Gap.TotalSeconds);
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
                SET info = @info, createdDate = @createdDate, lastReminded = @lastReminded, gapmins = @gapmins 
                WHERE id = @id";
            cmd.Parameters.AddWithValue("@info", reminder.Info);
            cmd.Parameters.AddWithValue("@createdDate", reminder.CreatedDate);
            cmd.Parameters.AddWithValue("@lastReminded", reminder.LastReminded ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@gapmins", (long)reminder.Gap.TotalSeconds);
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
    }
}
