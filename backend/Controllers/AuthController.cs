using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using backend.Services;
using backend.Models;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ReCaptchaService _reCaptchaService;
        private readonly S3Service _s3Service;
        private readonly SignInManager<User> _signInManager;
        private readonly IUserContextService _userContextService;

        public AuthController(IUserContextService userContextService, SignInManager<User> signInManager, UserManager<User> userManager, ReCaptchaService reCaptchaService, S3Service s3Service)
        {
            _userManager = userManager;
            _reCaptchaService = reCaptchaService;
            _s3Service = s3Service;
            _signInManager = signInManager;
            _userContextService = userContextService;
        }

        // register Action
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            
            if (registerDto.Password != registerDto.ConfirmPassword)
                return BadRequest("Passwords do not match");

            // verfy recaptcha
            var isCaptchaValid = await _reCaptchaService.VerifyCaptchaAsync(registerDto.RecaptchaToken);
            if (!isCaptchaValid)
                return BadRequest("Invalid recaptcha response");

            //uplad profile picture to S3
            string profilePictureUrl = null;
            if (registerDto.ProfilePicture != null)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(registerDto.ProfilePicture.FileName);
                using (var stream = registerDto.ProfilePicture.OpenReadStream())
                {
                    profilePictureUrl = await _s3Service.UploadFileAsync(stream, fileName);
                }
            }

            // user object
            var user = new User
            {
                UserName = registerDto.UserName,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                DateOfBirth = registerDto.DateOfBirth,
                ProfilePictureUrl = profilePictureUrl 
            };

            // user in Identity
            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("User registered successfully");
        }

        //login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            // validate recaptcha
            var isCaptchaValid = await _reCaptchaService.VerifyCaptchaAsync(loginDto.RecaptchaToken);
            if (!isCaptchaValid)
                return BadRequest("Invalid reCAPTCHA response");

            
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
                return Unauthorized("Invalid credentials");

            
            var passwordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!passwordValid)
                return Unauthorized("Invalid credentials");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id), 
                new Claim(ClaimTypes.Name, user.UserName), 
                
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(claimsIdentity);
            
            _userContextService.SetUserContext(user.Id, user.UserName);
            // session to id
            HttpContext.Session.SetString("UserId", user.Id.ToString());
            
            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new { message = "Login successful" });
        }

        // logout
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync(); 
            return Ok(new { message = "Logged out successfully" });
        }
    }
}
