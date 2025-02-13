using System;
using System.Collections.Generic;

namespace backend_employee_management.Models;

public partial class Passwordupdate
{
    public int Id { get; set; }

    public int? Userid { get; set; }

    public string Oldpasswordhash { get; set; }

    public string Newpasswordhash { get; set; }

    public DateTime? Updatedat { get; set; }

    public virtual User? User { get; set; }
}
