    public class Reminder
    {
        public int Id { get; set; }
        public required string Info { get; set; }            
        public DateTime CreatedDate { get; set; }    
        public DateTime? LastReminded { get; set; }   
        public TimeSpan Gap { get; set; }            
        public DateTime NextReminder => (LastReminded ?? CreatedDate).Add(Gap); 
    }