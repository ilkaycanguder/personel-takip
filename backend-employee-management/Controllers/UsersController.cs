using backend_employee_management.Data;
using backend_employee_management.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace backend_employee_management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : Controller
    {
        private readonly EmployeeManagementDbContext _context;
        private readonly ILogger<UsersController> _logger;
        private readonly IConfiguration _configuration;

        public UsersController(EmployeeManagementDbContext context, ILogger<UsersController> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet("profile/{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Id == id)
                    .Include(u => u.Roles)
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.Email,
                        u.Password,
                        u.Firstname,
                        u.Lastname,
                        Roles = u.Roles.Select(r => r.Rolename).ToList() // Roles bilgilerini al
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound();
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                // Hata mesajını loglayın
                Console.Error.WriteLine($"Exception: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }



        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest loginUser)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == loginUser.Email);
            if (user == null)
            {
                return BadRequest(new { message = "Invalid credentials" });
            }
            var inputPasswordHash = HashingHelper.HashPassword(loginUser.Password);
            if (user.Password != inputPasswordHash)
            {
                return BadRequest(new { message = "Invalid credentials" });
            }
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Username ?? ""),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpiresInMinutes"])),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                user = new { id = user.Id, role = user.Role },
                message = "Giriş başarılı"
            });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var usersWithRoles = await _context.Users
                .Where(u => u.Id != 1)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Firstname,
                    u.Lastname,
                    u.Email,
                    Roles = u.UserRoles.Select(ur => ur.Role.Rolename).ToList()
                })
                .ToListAsync();

            var result = usersWithRoles.Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.Firstname,
                u.Lastname,
                Roles = u.Roles
            }).ToList();

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<User>> PostUser([FromBody] User user, [FromQuery] int roleId)
        {
            if (user == null)
            {
                return BadRequest("User data is null");
            }

            var existingUserByEmail = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == user.Email);
            if (existingUserByEmail != null)
            {
                return Conflict("E-posta adresi zaten var");
            }

            // Kullanıcı adı zaten var mı kontrol et
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == user.Username);
            if (existingUser != null)
            {
                return Conflict("Username already exists");
            }

            if (string.IsNullOrEmpty(user.Role))
            {
                user.Role = "Employee";
            }

            var hasher = new PasswordHasher<User>();
            user.Password = hasher.HashPassword(user, user.Password);


            // Yeni kullanıcı oluşturma
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Kullanıcı rolünü UserRoles tablosuna ekle
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = roleId
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
        }

        // PUT api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }
            var existingUser = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (existingUser == null)
            {
                return NotFound();
            }

            // Eğer şifre güncellenmişse, hashleyin
            if (!string.IsNullOrEmpty(user.Password))
            {
                existingUser.Password = HashingHelper.HashPassword(user.Password);
            }
            existingUser.Username = user.Username ?? existingUser.Username;
            existingUser.Email = user.Email ?? existingUser.Email;
            existingUser.Firstname = user.Firstname ?? existingUser.Firstname;
            existingUser.Lastname = user.Lastname ?? existingUser.Lastname;

         
            // RoleIds ile UserRoles güncellemesi
            if (user.RoleIds != null)
            {
                // Yeni rollerin seti
                var newRoleIds = user.RoleIds.ToHashSet();

                // Mevcut rollerin seti
                var existingRoleIds = existingUser.UserRoles.Select(ur => ur.RoleId).ToHashSet();

                // Mevcut rollerin kaldırılacakları
                var rolesToRemove = existingUser.UserRoles
                    .Where(ur => !newRoleIds.Contains(ur.RoleId))
                    .ToList();

                // Yeni rollerin eklenecekleri
                var rolesToAdd = newRoleIds
                    .Except(existingRoleIds)
                    .Select(roleId => new UserRole
                    {
                        UserId = id,
                        RoleId = roleId
                    })
                    .ToList();

                // Roller kaldırılır
                if (rolesToRemove.Any())
                {
                    _context.UserRoles.RemoveRange(rolesToRemove);
                }

         
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = Convert.ToInt32(user.Role),
                };
                // Roller eklenir
                _context.UserRoles.Add(userRole);
                //_context.UserRoles.AddRange(rolesToAdd);

            }

            _context.Entry(existingUser).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(existingUser);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles) // İlişkili UserRoles kayıtlarını da al
                .Include(u => u.Passwordupdates)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }



            try
            {
                _context.UserRoles.RemoveRange(user.UserRoles);
                _context.Passwordupdates.RemoveRange(user.Passwordupdates);
                // Kullanıcıyı sil
                _context.Users.Remove(user);
                // Veritabanı değişikliklerini kaydet
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException dbEx)
            {
                // Detaylı hata bilgilerini al
                var errorMessage = dbEx.InnerException != null
                    ? dbEx.InnerException.Message
                    : dbEx.Message;

                _logger.LogError(dbEx, "Veritabanı güncelleme hatası oluştu: {Message}", errorMessage);
                return StatusCode(500, new { message = errorMessage });
            }

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
