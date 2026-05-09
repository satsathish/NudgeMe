using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RemindersApi.Controllers;

namespace NudgeMeAPI.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Reminder> Reminders => Set<Reminder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Reminder>(entity =>
        {
            entity.ToTable("reminders");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").UseIdentityByDefaultColumn();
            entity.Property(e => e.Info).HasColumnName("info").IsRequired();
            entity.Property(e => e.CreatedDate).HasColumnName("createddate");
            entity.Property(e => e.NextReminder).HasColumnName("nextreminder");
            entity.Property(e => e.Snooze).HasColumnName("snooze").HasDefaultValue(false);
        });
    }
}
