using Microsoft.EntityFrameworkCore;

public class JokeContext : DbContext
{
    public JokeContext(DbContextOptions<JokeContext> options) : base(options) { }

    public DbSet<Joke> Jokes { get; set; }
}