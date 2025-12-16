    public class Reminder
    {
        public int Id { get; set; }
        public required string Info { get; set; }            
        public DateTime CreatedDate { get; set; }    
        public DateTime? LastReminded { get; set; }   
        public bool Snooze { get; set; } = false;
        public DateTime NextReminder { get; set; }
    }