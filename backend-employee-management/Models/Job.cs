using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend_employee_management.Models;

public partial class Job
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string? Status { get; set; }

    public string? Category { get; set; }

    public int? Assignedto { get; set; }

    public int? Createdby { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Updatedat { get; set; }

    [JsonIgnore]
    public virtual User? AssignedtoNavigation { get; set; }

    [JsonIgnore]
    public virtual User? CreatedbyNavigation { get; set; }

    [JsonIgnore]
    public virtual ICollection<Jobupdate> Jobupdates { get; set; } = new List<Jobupdate>();
}
