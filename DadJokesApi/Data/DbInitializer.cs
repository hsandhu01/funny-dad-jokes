public static class DbInitializer
{
    public static void Initialize(JokeContext context)
    {
        context.Database.EnsureCreated();

        if (context.Jokes.Any())
        {
            return;
        }

        var jokes = new Joke[]
        {
            new Joke { Setup = "Why don't scientists trust atoms?", Punchline = "Because they make up everything!", Category = "science" },
            new Joke { Setup = "Did you hear about the claustrophobic astronaut?", Punchline = "He just needed a little space!", Category = "wordplay" },
            new Joke { Setup = "Why did the scarecrow win an award?", Punchline = "He was outstanding in his field!", Category = "pun" },
            new Joke { Setup = "Why don't eggs tell jokes?", Punchline = "They'd crack each other up!", Category = "food" },
            new Joke { Setup = "What do you call a fake noodle?", Punchline = "An impasta!", Category = "food" },
            new Joke { Setup = "Why did the math book look so sad?", Punchline = "Because it had too many problems.", Category = "school" },
            new Joke { Setup = "What do you call a bear with no teeth?", Punchline = "A gummy bear!", Category = "animals" },
            new Joke { Setup = "Why couldn't the pirate play cards?", Punchline = "Because he was sitting on the deck!", Category = "wordplay" },
            new Joke { Setup = "What do you call a boomerang that doesn't come back?", Punchline = "A stick!", Category = "oneliners" },
            new Joke { Setup = "Why did the cookie go to the doctor?", Punchline = "Because it was feeling crumbly!", Category = "food" },
            new Joke { Setup = "What do you call a can opener that doesn't work?", Punchline = "A can't opener!", Category = "pun" },
            new Joke { Setup = "Why did the golfer bring two pairs of pants?", Punchline = "In case he got a hole in one!", Category = "sports" },
            new Joke { Setup = "How do you organize a space party?", Punchline = "You planet!", Category = "science" },
            new Joke { Setup = "Why don't skeletons fight each other?", Punchline = "They don't have the guts!", Category = "halloween" },
            new Joke { Setup = "What do you call a parade of rabbits hopping backwards?", Punchline = "A receding hare-line!", Category = "animals" },
            new Joke { Setup = "Why did the scarecrow become a successful motivational speaker?", Punchline = "He was outstanding in his field!", Category = "pun" },
            new Joke { Setup = "What do you call a sleeping bull?", Punchline = "A bulldozer!", Category = "animals" },
            new Joke { Setup = "Why did the invisible man turn down the job offer?", Punchline = "He couldn't see himself doing it!", Category = "wordplay" },
            new Joke { Setup = "What do you call a bear with no ears?", Punchline = "B!", Category = "wordplay" },
            new Joke { Setup = "Why did the gym close down?", Punchline = "It just didn't work out!", Category = "pun" },
            new Joke { Setup = "What do you call a fake stone in Ireland?", Punchline = "A sham rock!", Category = "wordplay" },
            new Joke { Setup = "Why don't oysters donate to charity?", Punchline = "Because they're shellfish!", Category = "animals" },
            new Joke { Setup = "What do you call a pig that does karate?", Punchline = "A pork chop!", Category = "animals" },
            new Joke { Setup = "Why don't eggs tell jokes?", Punchline = "They'd crack each other up!", Category = "food" },
            new Joke { Setup = "What do you call a cow with no legs?", Punchline = "Ground beef!", Category = "animals" },
            new Joke { Setup = "Why did the scarecrow become a successful politician?", Punchline = "He was outstanding in his field!", Category = "pun" },
            new Joke { Setup = "What do you call a dog magician?", Punchline = "A labracadabrador!", Category = "animals" },
            new Joke { Setup = "Why did the coffee file a police report?", Punchline = "It got mugged!", Category = "pun" },
            new Joke { Setup = "What do you call a bear with no teeth?", Punchline = "A gummy bear!", Category = "animals" },
            new Joke { Setup = "How do you organize a space party?", Punchline = "You planet!", Category = "science" },
            new Joke { Setup = "Why don't scientists trust atoms?", Punchline = "Because they make up everything!", Category = "science" },
            new Joke { Setup = "What do you call a fake noodle?", Punchline = "An impasta!", Category = "food" },
            new Joke { Setup = "Why did the math book look so sad?", Punchline = "Because it had too many problems.", Category = "school" },
            new Joke { Setup = "What do you call a can opener that doesn't work?", Punchline = "A can't opener!", Category = "pun" },
            new Joke { Setup = "Why did the golfer bring two pairs of pants?", Punchline = "In case he got a hole in one!", Category = "sports" },
            new Joke { Setup = "What do you call a parade of rabbits hopping backwards?", Punchline = "A receding hare-line!", Category = "animals" },
            new Joke { Setup = "Why did the invisible man turn down the job offer?", Punchline = "He couldn't see himself doing it!", Category = "wordplay" },
            new Joke { Setup = "What do you call a bear with no ears?", Punchline = "B!", Category = "wordplay" },
            new Joke { Setup = "Why did the gym close down?", Punchline = "It just didn't work out!", Category = "pun" },
            new Joke { Setup = "What do you call a fake stone in Ireland?", Punchline = "A sham rock!", Category = "wordplay" },
            new Joke { Setup = "Why don't oysters donate to charity?", Punchline = "Because they're shellfish!", Category = "animals" },
            new Joke { Setup = "What do you call a pig that does karate?", Punchline = "A pork chop!", Category = "animals" },
            new Joke { Setup = "What do you call a cow with no legs?", Punchline = "Ground beef!", Category = "animals" },
            new Joke { Setup = "Why did the scarecrow become a successful politician?", Punchline = "He was outstanding in his field!", Category = "pun" },
        };

        context.Jokes.AddRange(jokes);
        context.SaveChanges();
    }
}