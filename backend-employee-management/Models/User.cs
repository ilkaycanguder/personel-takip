using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend_employee_management.Models;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string? Firstname { get; set; }

    public string? Lastname { get; set; }

    public string Role { get; set; } = "Employee";

    public virtual ICollection<Job> JobAssignedtoNavigations { get; set; } = new List<Job>();

    public virtual ICollection<Job> JobCreatedbyNavigations { get; set; } = new List<Job>();

    public virtual ICollection<Jobupdate> Jobupdates { get; set; } = new List<Jobupdate>();

    public virtual ICollection<Passwordupdate> Passwordupdates { get; set; } = new List<Passwordupdate>();

    public virtual ICollection<Role>? Roles { get; set; } = new List<Role>();

    [JsonIgnore]
    public ICollection<UserRole>? UserRoles { get; set; } = new List<UserRole>();
    [JsonIgnore]
    public IEnumerable<int> RoleIds => UserRoles?.Select(ur => ur.RoleId) ?? Enumerable.Empty<int>();
    [NotMapped] // Bu property veritabanında saklanmaz
    public string RoleIdsAsString
    {
        get => string.Join(",", RoleIds);
        set
        {
            if (!string.IsNullOrEmpty(value))
            {
                var roleIdsArray = value.Split(',').Select(int.Parse).ToArray();
                UserRoles = roleIdsArray.Select(roleId => new UserRole { RoleId = roleId }).ToList();
            }
        }
    }



}
