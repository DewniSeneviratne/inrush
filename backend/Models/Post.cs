namespace backend.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string Caption { get; set; }
        public string ContentURL { get; set; }
        public DateTime CreatedAt { get; set; }

        //fks
        public string UserId { get; set; }
        public User User { get; set; } 
    }
}
