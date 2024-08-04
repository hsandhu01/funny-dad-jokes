import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAFYbEHQ9Shz18JJ_OuuUEoEszSXmtFwUE",
    authDomain: "dad-jokes-7b55c.firebaseapp.com",
    projectId: "dad-jokes-7b55c",
    storageBucket: "dad-jokes-7b55c.appspot.com",
    messagingSenderId: "1039832499",
    appId: "1:1039832499:web:11d4fd6e7be2dd618ce7c6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const jokes = [
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!", category: "science" },
  { setup: "Did you hear about the claustrophobic astronaut?", punchline: "He just needed a little space!", category: "wordplay" },
  { setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field!", category: "pun" },
  { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!", category: "food" },
  { setup: "What do you call a fake noodle?", punchline: "An impasta!", category: "food" },
  { setup: "Why did the math book look so sad?", punchline: "Because it had too many problems.", category: "school" },
  { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!", category: "animals" },
  { setup: "Why couldn't the pirate play cards?", punchline: "Because he was sitting on the deck!", category: "wordplay" },
  { setup: "What do you call a boomerang that doesn't come back?", punchline: "A stick!", category: "oneliners" },
  { setup: "Why did the cookie go to the doctor?", punchline: "Because it was feeling crumbly!", category: "food" },
  { setup: "What do you call a can opener that doesn't work?", punchline: "A can't opener!", category: "pun" },
  { setup: "Why did the golfer bring two pairs of pants?", punchline: "In case he got a hole in one!", category: "sports" },
  { setup: "How do you organize a space party?", punchline: "You planet!", category: "science" },
  { setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts!", category: "halloween" },
  { setup: "What do you call a parade of rabbits hopping backwards?", punchline: "A receding hare-line!", category: "animals" },
  { setup: "Why did the scarecrow become a successful motivational speaker?", punchline: "He was outstanding in his field!", category: "pun" },
  { setup: "What do you call a sleeping bull?", punchline: "A bulldozer!", category: "animals" },
  { setup: "Why did the invisible man turn down the job offer?", punchline: "He couldn't see himself doing it!", category: "wordplay" },
  { setup: "What do you call a bear with no ears?", punchline: "B!", category: "wordplay" },
  { setup: "Why did the gym close down?", punchline: "It just didn't work out!", category: "pun" },
  { setup: "What do you call a fake stone in Ireland?", punchline: "A sham rock!", category: "wordplay" },
  { setup: "Why don't oysters donate to charity?", punchline: "Because they're shellfish!", category: "animals" },
  { setup: "What do you call a pig that does karate?", punchline: "A pork chop!", category: "animals" },
  { setup: "What do you call a cow with no legs?", punchline: "Ground beef!", category: "animals" },
  { setup: "Why did the scarecrow become a successful politician?", punchline: "He was outstanding in his field!", category: "pun" },
  { setup: "What do you call a dog magician?", punchline: "A labracadabrador!", category: "animals" },
  { setup: "Why did the coffee file a police report?", punchline: "It got mugged!", category: "pun" },
];

async function seedJokes() {
    const jokesCollection = collection(db, 'jokes');
    
    for (const joke of jokes) {
      try {
        await addDoc(jokesCollection, {
          ...joke,
          rating: 0,
          ratingCount: 0
        });
        console.log(`Added joke: ${joke.setup}`);
      } catch (error) {
        console.error(`Error adding joke: ${joke.setup}`, error);
      }
    }
    
    console.log('Finished seeding jokes');
  }
  
  seedJokes().then(() => process.exit());