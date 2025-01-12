using backend.Models.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Amazon;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace backend.Controllers
{
    [Route("api/posts")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        
        private readonly UsersDbContext _context;
        private readonly S3Service _s3Service;
        private readonly IUserContextService _userContextService;

        public PostsController(UsersDbContext context, S3Service s3Service, IUserContextService userContextService)
        {      
            _context = context;
            _s3Service = s3Service;
            _userContextService = userContextService; 
        }

        //add post
        [HttpPost("add")]
        public async Task<IActionResult> AddPost([FromForm] PostDto postDto)
        {
            
            var userContext = _userContextService.GetUserContext();

            if (userContext == null || string.IsNullOrEmpty(userContext.UserId))
            {
                return Unauthorized("User is not logged in.");
            }

            //upload post pic to S3
            string postPicUrl = null;
            if (postDto.ContentFile != null)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(postDto.ContentFile.FileName);
                using (var stream = postDto.ContentFile.OpenReadStream())
                {
                    postPicUrl = await _s3Service.UploadFileAsync(stream, fileName);
                }
            }

            var post = new Post
            {
                Caption = postDto.Caption,
                ContentURL = postPicUrl,
                UserId = userContext.UserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return Ok(post);
        }

        //list of all posts
        [HttpGet("list")]
        public async Task<IActionResult> ListPosts()
        {
            var userContext = _userContextService.GetUserContext();
            string currentUserId = userContext?.UserId;

            if (currentUserId == null)
            {
                return Unauthorized("User is not logged in.");
            }

            //loged in user details
            var loggedInUser = await _context.Users
                .Where(u => u.Id == currentUserId)
                .Select(u => new
                {
                    u.FirstName,
                    u.LastName,
                    u.ProfilePictureUrl
                })
                .FirstOrDefaultAsync();

            if (loggedInUser == null)
            {
                return NotFound("Logged-in user details not found.");
            }

            //posts with necessary details
            var posts = await _context.Posts
                .Include(p => p.User)
                .Select(p => new
                {
                    p.Id,
                    p.Caption,
                    p.ContentURL,
                    p.CreatedAt,
                    UserFirstName = p.User.FirstName,
                    UserLastName = p.User.LastName,
                    PostUserProfilePictureUrl = p.User.ProfilePictureUrl, 
                    LoggedInUserProfilePictureUrl = loggedInUser.ProfilePictureUrl, 
                    LoggedInUserFirstName = loggedInUser.FirstName, 
                    LoggedInUserLastName = loggedInUser.LastName,  
                    LikesCount = _context.Likes.Count(l => l.PostId == p.Id),
                    LikedByCurrentUser = _context.Likes.Any(l => l.PostId == p.Id && l.UserId == currentUserId)
                })
                .OrderByDescending(p => p.CreatedAt) 
                .ThenByDescending(p => p.LikesCount)
                .ToListAsync();

            return Ok(posts);
        }


        // Like Post
        [HttpPost("like/{postId}")]
        public async Task<IActionResult> LikePost(int postId)
        {
            
            var userContext = _userContextService.GetUserContext();

            if (userContext == null || string.IsNullOrEmpty(userContext.UserId))
            {
                return Unauthorized("User is not logged in.");
            }

            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userContext.UserId);

            if (existingLike != null)
            {
                return BadRequest("You have already liked this post.");
            }

            var like = new Like
            {
                PostId = postId,
                UserId = userContext.UserId,
                LikedAt = DateTime.UtcNow,

            };

            _context.Likes.Add(like);
            await _context.SaveChangesAsync();

            return Ok("Post liked successfully.");
        }
    }


}
