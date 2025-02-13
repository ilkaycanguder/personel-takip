using Microsoft.AspNetCore.Mvc;
using backend_employee_management;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using backend_employee_management.Data;
using backend_employee_management.Models;

namespace backend_employee_management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobsController : ControllerBase
    {
        private readonly EmployeeManagementDbContext _context; 
        private readonly ILogger<UsersController> _logger;

        public JobsController(EmployeeManagementDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Job>>> GetAllJobs()
        {
            try
            {
                var jobs = await _context.Jobs
                    .Include(job => job.Jobupdates)
                    .ToListAsync();

                if (jobs == null || !jobs.Any())
                {
                    return NotFound("No jobs found");
                }

                return Ok(jobs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Job>>> GetJobs(int userId)
        {
            var jobs = await _context.Jobs
                .Where(j => j.Assignedto == userId)
                .ToListAsync();

            return Ok(jobs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Job>> GetJob(int id, bool includeUserCheck = false)
        {
            var job = await _context.Jobs
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null)
            {
                return NotFound();
            }

            if (includeUserCheck)
            {
                var username = User.Identity?.Name;
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized();
                }

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (user == null)
                {
                    return Unauthorized();
                }

                if (job.Assignedto != user.Id)
                {
                    return Forbid();
                }
            }

            return Ok(job);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutJob(int id, [FromBody] Job job)
        {
            if (id != job.Id)
            {
                return BadRequest("Job ID mismatch");
            }

            var existingJob = _context.Jobs.Local.FirstOrDefault(j => j.Id == id);
            if (existingJob != null)
            {
                _context.Entry(existingJob).State = EntityState.Detached;
            }

            existingJob = await _context.Jobs.FindAsync(id);

            if (existingJob == null)
            {
                return NotFound("Job not found");
            }

            existingJob.Title = job.Title;
            existingJob.Description = job.Description;
            existingJob.Status = job.Status;
            existingJob.Category = job.Category;
            existingJob.Assignedto = job.Assignedto;
            existingJob.Updatedat = DateTime.UtcNow; 

            _context.Entry(existingJob).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                var user = await _context.Users.FindAsync(job.Assignedto); 
                if (user == null)
                {
                    return NotFound("User not found");
                }

                var adminId = 1;
                var jobUpdate = new Jobupdate
                {
                    Jobid = job.Id,
                    Updatetype = "Update",
                    Comment = "Job updated",
                    Updatedby = adminId,
                    Updatedat = DateTime.UtcNow
                };

                _context.Jobupdates.Add(jobUpdate);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!JobExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPost]
        public ActionResult<Job> PostJob(Job job)
        {
            var adminUser = _context.Users.FirstOrDefault(u => u.Username == "admin");
            if (adminUser == null)
            {
                return BadRequest("Admin kullanıcı bulunamadı.");
            }

            // job nesnesinin CreatedBy alanını Admin kullanıcı ID'si ile ayarla
            job.Createdby = adminUser.Id;
            if (job.Assignedto == null || !_context.Users.Any(u => u.Id == job.Assignedto))
            {
                job.Assignedto = adminUser.Id; // Varsayılan olarak admin'e atama yap
            }
            job.Createdat = DateTime.UtcNow;
            job.Updatedat = DateTime.UtcNow;

            _context.Jobs.Add(job);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetJob), new { id = job.Id }, job);
        }


        [HttpDelete("{id}")]
        public IActionResult DeleteJob(int id)
        {
            // Job kaydını bul
            var job = _context.Jobs.Find(id);
            if (job == null)
            {
                return NotFound();
            }

            // İlgili Jobupdate kayıtlarını sil
            var jobUpdates = _context.Jobupdates.Where(ju => ju.Jobid == id).ToList();
            _context.Jobupdates.RemoveRange(jobUpdates);

            // Ardından Job kaydını sil
            _context.Jobs.Remove(job);
            _context.SaveChanges();

            return NoContent();
        }

        private bool JobExists(int id)
        {
            return _context.Jobs.Any(e => e.Id == id);
        }
    }
}
