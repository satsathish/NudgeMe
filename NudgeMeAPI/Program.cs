var builder = WebApplication.CreateBuilder(args);

// Configure WebRootPath to use wwwroot from output directory
var outputWwwroot = Path.Combine(AppContext.BaseDirectory, "wwwroot");
builder.Environment.WebRootPath = outputWwwroot;
if (Directory.Exists(outputWwwroot))
{
    builder.Environment.WebRootFileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(outputWwwroot);
}
Console.WriteLine($"WebRootPath set to: {builder.Environment.WebRootPath}");
Console.WriteLine($"Directory exists: {Directory.Exists(outputWwwroot)}");

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

// Serve static files first
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("NudgeMeCors");

// PostgreSQL initialization
var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "postgres";
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "";
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "nudgeme";

var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPassword}";
Console.WriteLine($"PostgreSQL connecting to {dbHost}:{dbPort}/{dbName}");

using (var connection = new Npgsql.NpgsqlConnection(connectionString))
{
    connection.Open();
    var cmd = connection.CreateCommand();
    cmd.CommandText = @"CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        info TEXT NOT NULL,
        createdDate TEXT NOT NULL,
        lastReminded TEXT,
        gapmins INTEGER NOT NULL
    );";
    cmd.ExecuteNonQuery();
    Console.WriteLine($"PostgreSQL initialized");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Map API controllers
app.MapControllers();

// Fallback to index.html for client-side routing (SPA)
app.MapFallbackToFile("index.html");

app.Run();
