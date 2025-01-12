namespace backend.Models
{
    public class Like
    {
        public int Id { get; set; }

        public DateTime LikedAt { get; set; }

        //fk to posts
        public int PostId { get; set; }
        public Post Post { get; set; } 

        // Fks
        public string UserId { get; set; }
        public User User { get; set; } 
    }

}
