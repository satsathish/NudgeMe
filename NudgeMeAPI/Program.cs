var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var connection = new Microsoft.Data.Sqlite.SqliteConnection("Data Source=/app/NudgeMeAPI/reminder.db"))
{
    connection.Open();
    var cmd = connection.CreateCommand();
    cmd.CommandText = @"CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        info TEXT NOT NULL,
        createdDate TEXT NOT NULL,
        lastReminded TEXT,
        gapSeconds INTEGER NOT NULL
    );";
    cmd.ExecuteNonQuery();
    Console.WriteLine("Table Created.");
}

app.MapControllers();
app.Run("http://0.0.0.0:5000");