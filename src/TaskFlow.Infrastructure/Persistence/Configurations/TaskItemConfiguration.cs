using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskFlow.Domain.Entities;
using TaskItemEntity = TaskFlow.Domain.Entities.Task;

namespace TaskFlow.Infrastructure.Persistence.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItemEntity>
{
    public void Configure(EntityTypeBuilder<TaskItemEntity> builder)
    {
        builder.ToTable("TaskItems");

        builder.HasKey(task => task.Id);

        builder.Property(task => task.Id)
            .ValueGeneratedNever();

        builder.Property(task => task.UserId)
            .IsRequired();

        builder.Property(task => task.CategoryId);

        builder.Property(task => task.Title)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(task => task.Description)
            .HasMaxLength(1000);

        builder.Property(task => task.Priority)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(task => task.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(task => task.DueDate);

        builder.Property(task => task.CompletedAt);

        builder.Property(task => task.IsDeleted)
            .IsRequired();

        builder.HasIndex(task => new { task.UserId, task.Status });

        builder.HasIndex(task => new { task.UserId, task.DueDate });

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(task => task.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Category>()
            .WithMany()
            .HasForeignKey(task => task.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.OwnsOne(task => task.AuditInfo, audit =>
        {
            audit.Property(info => info.CreatedAt)
                .HasColumnName("CreatedAt")
                .IsRequired();

            audit.Property(info => info.UpdatedAt)
                .HasColumnName("UpdatedAt")
                .IsRequired();

            audit.Property(info => info.DeletedAt)
                .HasColumnName("DeletedAt");
        });

        builder.Navigation(task => task.AuditInfo)
            .IsRequired();
    }
}
