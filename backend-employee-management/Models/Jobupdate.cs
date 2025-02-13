using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend_employee_management.Models;

public partial class Jobupdate
{
    public int Id { get; set; }

    public int? Jobid { get; set; }

    public string? Updatetype { get; set; }

    public string? Comment { get; set; }

    public int? Updatedby { get; set; }

    public DateTime? Updatedat { get; set; }

    [JsonIgnore]
    public virtual Job? Job { get; set; }

    [JsonIgnore]
    public virtual User? UpdatedbyNavigation { get; set; }
}
