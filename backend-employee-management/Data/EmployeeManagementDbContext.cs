using System;
using System.Collections.Generic;
using backend_employee_management.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_employee_management.Data;

public partial class EmployeeManagementDbContext : DbContext
{
    public EmployeeManagementDbContext()
    {
    }

    public EmployeeManagementDbContext(DbContextOptions<EmployeeManagementDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Job> Jobs { get; set; }

    public virtual DbSet<Jobupdate> Jobupdates { get; set; }

    public virtual DbSet<Passwordupdate> Passwordupdates { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Models.Task> Tasks { get; set; }

    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<UserRole> UserRoles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=localhost;Database=EmployeeManagementDb;Username=ILKAY;Password=123456");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Job>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("jobs_pkey");

            entity.ToTable("jobs");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Assignedto).HasColumnName("assignedto");
            entity.Property(e => e.Category)
                .HasMaxLength(50)
                .HasColumnName("category");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp with time zone")
                .HasColumnName("createdat");
            entity.Property(e => e.Createdby).HasColumnName("createdby");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .HasColumnName("title");
            entity.Property(e => e.Updatedat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp with time zone")
                .HasColumnName("updatedat");

            entity.HasOne(d => d.AssignedtoNavigation).WithMany(p => p.JobAssignedtoNavigations)
                .HasForeignKey(d => d.Assignedto)
                .HasConstraintName("jobs_assignedto_fkey");

            entity.HasOne(d => d.CreatedbyNavigation).WithMany(p => p.JobCreatedbyNavigations)
                .HasForeignKey(d => d.Createdby)
                 .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("jobs_createdby_fkey");
        });

        modelBuilder.Entity<Jobupdate>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("jobupdates_pkey");

            entity.ToTable("jobupdates");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.Jobid).HasColumnName("jobid");
            entity.Property(e => e.Updatedat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp with time zone")
                .HasColumnName("updatedat");
            entity.Property(e => e.Updatedby).HasColumnName("updatedby");
            entity.Property(e => e.Updatetype)
                .HasMaxLength(20)
                .HasColumnName("updatetype");

            entity.HasOne(d => d.Job).WithMany(p => p.Jobupdates)
                .HasForeignKey(d => d.Jobid)
                .HasConstraintName("jobupdates_jobid_fkey");

            entity.HasOne(d => d.UpdatedbyNavigation).WithMany(p => p.Jobupdates)
                .HasForeignKey(d => d.Updatedby)
                .HasConstraintName("jobupdates_updatedby_fkey");
        });

        modelBuilder.Entity<Passwordupdate>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("passwordupdates_pkey");

            entity.ToTable("passwordupdates");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Newpasswordhash)
                .HasMaxLength(256)
                .HasColumnName("newpasswordhash");
            entity.Property(e => e.Oldpasswordhash)
                .HasMaxLength(256)
                .HasColumnName("oldpasswordhash");
            entity.Property(e => e.Updatedat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp with time zone")
                .HasColumnName("updatedat");
            entity.Property(e => e.Userid).HasColumnName("userid");

            entity.HasOne(d => d.User).WithMany(p => p.Passwordupdates)
                .HasForeignKey(d => d.Userid)
                .HasConstraintName("passwordupdates_userid_fkey");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("roles_pkey");

            entity.ToTable("roles");

            entity.HasIndex(e => e.Rolename, "roles_rolename_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Rolename)
                .HasMaxLength(50)
                .HasColumnName("rolename");
        });

        modelBuilder.Entity<Models.Task>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("tasks_pkey");

            entity.ToTable("tasks");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Category)
                .HasMaxLength(255)
                .HasColumnName("category");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.HasIndex(e => e.Username, "users_username_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.Firstname)
                .HasMaxLength(50)
                .HasColumnName("firstname");
            entity.Property(e => e.Lastname)
                .HasMaxLength(50)
                .HasColumnName("lastname");
            entity.Property(e => e.Password)
                .HasMaxLength(256)
                .HasColumnName("password");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasColumnName("role");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .HasColumnName("username");

            entity.HasMany(d => d.Roles)
         .WithMany(p => p.Users)
         .UsingEntity<UserRole>(
             j => j
                 .HasOne(ur => ur.Role)
                 .WithMany(r => r.UserRoles)
                 .HasForeignKey(ur => ur.RoleId)
                 .OnDelete(DeleteBehavior.Restrict)
                 .HasConstraintName("userroles_roleid_fkey"),
             j => j
                 .HasOne(ur => ur.User)
                 .WithMany(u => u.UserRoles)
                 .HasForeignKey(ur => ur.UserId)
                 .OnDelete(DeleteBehavior.ClientSetNull)
                 .HasConstraintName("userroles_userid_fkey"),
             j =>
             {
                 j.HasKey(ur => new { ur.UserId, ur.RoleId }).HasName("userroles_pkey");
                 j.ToTable("userroles");
                 j.Property(ur => ur.UserId).HasColumnName("userid");
                 j.Property(ur => ur.RoleId).HasColumnName("roleid");
             });
        });


        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
