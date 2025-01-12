using backend.Models;

namespace backend.Services
{
    public interface IUserContextService
    {
        void SetUserContext(string userId, string userName);
        UserContext GetUserContext();
    }

    public class UserContextService : IUserContextService
    {
        private UserContext _userContext;

        public void SetUserContext(string userId, string userName)
        {
            _userContext = new UserContext
            {
                UserId = userId,
                UserName = userName
            };
        }

        public UserContext GetUserContext()
        {
            return _userContext;
        }
    }

}
