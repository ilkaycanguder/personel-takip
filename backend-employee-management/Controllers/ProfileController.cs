using backend_employee_management.Data;
using backend_employee_management.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace backend_employee_management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : Controller
    {
        private readonly EmployeeManagementDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public ProfileController(EmployeeManagementDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Profil güncelleme
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] User model)
        {
            var username = model.Username;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
            {
                return NotFound();
            }

            user.Firstname = model.Firstname;
            user.Lastname = model.Lastname;
            user.Email = model.Email;

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(user.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(user);
        }
        [Authorize]
        [HttpPut("password")]
        public async Task<IActionResult> UpdatePassword([FromBody] Passwordupdate model)
        {
            try
            {
                var username = User.Identity.Name;
                if (string.IsNullOrEmpty(username))
                {
                    return BadRequest("Kullanıcı adı bulunamadı.");
                }

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (user == null)
                {
                    return NotFound("Kullanıcı bulunamadı.");
                }

                if (string.IsNullOrEmpty(model.Oldpasswordhash) || string.IsNullOrEmpty(model.Newpasswordhash))
                {
                    return BadRequest("Eski veya yeni şifre boş olamaz.");
                }

                // Eski şifre doğrulaması
                var oldPasswordHash = HashingHelper.HashPassword(model.Oldpasswordhash);
                if (user.Password != oldPasswordHash)
                {
                    return BadRequest("Eski şifre yanlış.");
                }

                // Yeni şifreyi güncelleme
                var newPasswordHash = HashingHelper.HashPassword(model.Newpasswordhash);
                user.Password = newPasswordHash;
                await _context.SaveChangesAsync(); // Users tablosunda şifre güncelleniyor.

                // Passwordupdate tablosuna kayıt ekleme
                var passwordUpdate = new Passwordupdate
                {
                    Userid = user.Id,
                    Oldpasswordhash = oldPasswordHash,
                    Newpasswordhash = newPasswordHash,
                    Updatedat = DateTime.UtcNow
                };
                _context.Passwordupdates.Add(passwordUpdate);
                await _context.SaveChangesAsync(); // Passwordupdate tablosuna kayıt ekleniyor.

                return Ok("Şifre başarıyla güncellendi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Şifre güncelleme sırasında bir hata oluştu: " + ex.Message);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
