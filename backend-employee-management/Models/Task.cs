using System;
using System.Collections.Generic;

namespace backend_employee_management.Models;

public partial class Task
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Category { get; set; }

    public string? Status { get; set; }
}
