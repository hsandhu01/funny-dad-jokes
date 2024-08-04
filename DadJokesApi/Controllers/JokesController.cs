using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class JokesController : ControllerBase
{
    private readonly JokeContext _context;
    private readonly IDistributedCache _cache;

    public JokesController(JokeContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    [HttpGet("random")]
    public async Task<ActionResult<Joke>> GetRandomJoke(string category = "all")
    {
        var cacheKey = $"random_joke_{category}";
        var cachedJoke = await _cache.GetStringAsync(cacheKey);

        if (cachedJoke != null)
        {
            return Ok(JsonSerializer.Deserialize<Joke>(cachedJoke));
        }

        var query = _context.Jokes.AsQueryable();
        if (category != "all")
        {
            query = query.Where(j => j.Category == category);
        }

        var count = await query.CountAsync();
        var random = new Random();
        var joke = await query.Skip(random.Next(count)).FirstOrDefaultAsync();

        if (joke == null)
        {
            return NotFound();
        }

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(joke), 
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5) });

        return Ok(joke);
    }

    [HttpPost("{id}/rate")]
    public async Task<IActionResult> RateJoke(int id, [FromBody] RatingRequest request)
    {
        var joke = await _context.Jokes.FindAsync(id);
        if (joke == null)
        {
            return NotFound();
        }

        joke.AverageRating = ((joke.AverageRating * joke.RatingCount) + request.Rating) / (joke.RatingCount + 1);
        joke.RatingCount++;

        await _context.SaveChangesAsync();

        // Clear cache for this joke's category
        await _cache.RemoveAsync($"random_joke_{joke.Category}");
        await _cache.RemoveAsync("random_joke_all");

        return Ok(joke);
    }
}

public class RatingRequest
{
    public int Rating { get; set; }
}