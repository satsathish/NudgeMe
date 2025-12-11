var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// CORS: explicit origins (wildcard + credentials is invalid). Use env var ALLOWED_ORIGINS (comma-separated) or fallback list.
const string CorsPolicy = "NudgeMeCors";
var allowedOriginsEnv = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
string[] allowedOrigins = string.IsNullOrWhiteSpace(allowedOriginsEnv)
    ? new[] {
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:8080", // via docker mapped nginx
        "http://127.0.0.1:8080"
      }
    : allowedOriginsEnv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: CorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();



app.UseCors("NudgeMeCors");

var dbPathEnv = Environment.GetEnvironmentVariable("DB_PATH");
var dbPath = string.IsNullOrWhiteSpace(dbPathEnv) ? "/data/reminder.db" : dbPathEnv;
var dbDir = Path.GetDirectoryName(dbPath);
if (!string.IsNullOrWhiteSpace(dbDir) && !Directory.Exists(dbDir))
{
    Directory.CreateDirectory(dbDir);
}

Console.WriteLine($"SQLite dfasf at {dbPath}");

using (var connection = new Microsoft.Data.Sqlite.SqliteConnection($"Data Source={dbPath}"))
{
    connection.Open();
    var cmd = connection.CreateCommand();
    cmd.CommandText = @"CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        info TEXT NOT NULL,
        createdDate TEXT NOT NULL,
        lastReminded TEXT,
        gapmins INTEGER NOT NULL
    );";
    cmd.ExecuteNonQuery();
    Console.WriteLine($"SQLite initialized at {dbPath}");
}

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.Run();
}
else
{
    app.Run("http://0.0.0.0:5000");
}
