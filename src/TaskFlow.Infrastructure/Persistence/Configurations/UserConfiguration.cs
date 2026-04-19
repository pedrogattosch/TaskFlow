using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskFlow.Domain.Entities;

namespace TaskFlow.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(user => user.Id);

        builder.Property(user => user.Id)
            .ValueGeneratedNever();

        builder.Property(user => user.Name)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(user => user.Email)
            .HasMaxLength(180)
            .IsRequired();

        builder.HasIndex(user => user.Email)
            .IsUnique();

        builder.Property(user => user.PasswordHash)
            .HasMaxLength(500)
            .IsRequired();

        builder.OwnsOne(user => user.AuditInfo, audit =>
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

        builder.Navigation(user => user.AuditInfo)
            .IsRequired();
    }
}
