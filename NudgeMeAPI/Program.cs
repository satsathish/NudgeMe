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

// PostgreSQL connection string
var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "postgresql";
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "nudgeme";
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "nudgemepass";
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "nudgeme";

var connectionString = $"Host={dbHost};Port={dbPort};Username={dbUser};Password={dbPassword};Database={dbName}";
builder.Configuration.GetSection("ConnectionStrings")["DefaultConnection"] = connectionString;

Console.WriteLine($"PostgreSQL connecting to {dbHost}:{dbPort}/{dbName}");

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
