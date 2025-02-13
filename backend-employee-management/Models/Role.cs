﻿using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend_employee_management.Models;

public partial class Role
{
    public int Id { get; set; }

    public string Rolename { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

}
