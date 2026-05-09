using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NudgeMeAPI.Data;

namespace RemindersApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReminderController(AppDbContext db) : ControllerBase
    {
        private readonly AppDbContext _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reminders = await _db.Reminders.OrderBy(r => r.Id).ToListAsync();
            return Ok(reminders);
        }

        [HttpGet("Nudge/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var reminder = await _db.Reminders.FindAsync(id);
            return reminder is null ? NotFound() : Ok(reminder);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Reminder reminder)
        {
            reminder.CreatedDate = DateTime.UtcNow;
            _db.Reminders.Add(reminder);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = reminder.Id }, reminder);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Reminder patch)
        {
            var existing = await _db.Reminders.FindAsync(id);
            if (existing is null) return NotFound();

            existing.Info = patch.Info;
            existing.NextReminder = patch.NextReminder;
            existing.CreatedDate = patch.CreatedDate;
            existing.Snooze = patch.Snooze;
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _db.Reminders.FindAsync(id);
            if (existing is null) return NotFound();

            _db.Reminders.Remove(existing);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPatch("{id}/snooze")]
        public async Task<IActionResult> UpdateSnooze(int id, [FromBody] SnoozeRequest request)
        {
            var existing = await _db.Reminders.FindAsync(id);
            if (existing is null) return NotFound();

            existing.Snooze = request.Snooze;
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}
