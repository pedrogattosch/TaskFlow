using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskFlow.Domain.Entities;

namespace TaskFlow.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(category => category.Id);

        builder.Property(category => category.Id)
            .ValueGeneratedNever();

        builder.Property(category => category.UserId)
            .IsRequired();

        builder.Property(category => category.Name)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(category => category.Color)
            .HasMaxLength(20);

        builder.HasIndex(category => new { category.UserId, category.Name })
            .IsUnique();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(category => category.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.OwnsOne(category => category.AuditInfo, audit =>
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

        builder.Navigation(category => category.AuditInfo)
            .IsRequired();
    }
}
