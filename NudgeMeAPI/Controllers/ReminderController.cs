using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace RemindersApi.Controllers
{
    [ApiController]
    [Route("[controller]")]

    public class ReminderController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=/data/reminder.db";

        [HttpGet]
        public IActionResult GetAll()
        {
            var reminders = new List<Reminder>();
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT * FROM reminders";
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                reminders.Add(new Reminder
                {
                    Id = reader.GetInt32(0),
                    Info = reader.GetString(1),
                    CreatedDate = DateTime.Parse(reader.GetString(2)),
                    LastReminded = reader.IsDBNull(3) ? (DateTime?)null : DateTime.Parse(reader.GetString(3)),
                    Gap = TimeSpan.FromSeconds(reader.GetInt64(4))
                });
            }
            return Ok(reminders);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Reminder reminder)
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            var cmd = connection.CreateCommand();
            cmd.CommandText = @"INSERT INTO reminders (info, createdDate, lastReminded, gapmins) VALUES ($info, $createdDate, $lastReminded, $gapmins)";
            cmd.Parameters.AddWithValue("$info", reminder.Info);
            cmd.Parameters.AddWithValue("$createdDate", new DateTime());
            cmd.Parameters.AddWithValue("$lastReminded", new DateTime());
            cmd.Parameters.AddWithValue("$gapmins", reminder.Gap.TotalSeconds);
            cmd.ExecuteNonQuery();
            return Ok();
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Reminder reminder)
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            var cmd = connection.CreateCommand();
            cmd.CommandText = @"UPDATE reminders SET info = $info, createdDate = $createdDate, lastReminded = $lastReminded, gapmins = $gapmins WHERE id = $id";
            cmd.Parameters.AddWithValue("$info", reminder.Info);
            cmd.Parameters.AddWithValue("$createdDate", reminder.CreatedDate.ToString("o"));
            cmd.Parameters.AddWithValue("$lastReminded", reminder.LastReminded?.ToString("o") ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("gapmins", reminder.Gap.TotalSeconds);
            cmd.Parameters.AddWithValue("$id", id);
            var rows = cmd.ExecuteNonQuery();
            if (rows == 0) return NotFound();
            return Ok();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "DELETE FROM reminders WHERE id = $id";
            cmd.Parameters.AddWithValue("$id", id);
            var rows = cmd.ExecuteNonQuery();
            if (rows == 0) return NotFound();
            return Ok();
        }
    }
}
