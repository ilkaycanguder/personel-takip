using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend_employee_management;
using Microsoft.EntityFrameworkCore;
using backend_employee_management.Data;
using backend_employee_management.Models;

namespace backend_employee_management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobUpdatesController : ControllerBase
    {
        private readonly EmployeeManagementDbContext _context;

        public JobUpdatesController(EmployeeManagementDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Jobupdate>>> GetJobUpdates()
        {
            return await _context.Jobupdates.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Jobupdate>> GetJobUpdate(int id)
        {
            var jobUpdate = await _context.Jobupdates.FindAsync(id);

            if (jobUpdate == null)
            {
                return NotFound();
            }

            return Ok(jobUpdate);
        }

        [HttpPost]
        public async Task<IActionResult> PostJobupdate([FromBody] Jobupdate jobupdate)
        {
            if (jobupdate == null)
            {
                return BadRequest("Jobupdate is null");
            }

            if (!_context.Users.Any(u => u.Id == jobupdate.Updatedby))
            {
                return BadRequest("Invalid userId");
            }
            _context.Jobupdates.Add(jobupdate);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJobUpdate), new { id = jobupdate.Id }, jobupdate);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJobUpdate(int id)
        {
            var jobUpdate = await _context.Jobupdates.FindAsync(id);
            if (jobUpdate == null)
            {
                return NotFound();
            }

            _context.Jobupdates.Remove(jobUpdate);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool JobUpdateExists(int id)
        {
            return _context.Jobupdates.Any(e => e.Id == id);
        }
    }
}
