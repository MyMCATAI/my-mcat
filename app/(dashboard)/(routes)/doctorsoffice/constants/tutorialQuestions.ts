import { Flashcard } from '../FlashcardDeck';

export const tutorialQuestions: Flashcard[] = [
  {
    questionType: 'flashcard',
    id: 'tutorial-1',
    questionContent: 'How do I press correct or incorrect on a flashcard? (press space) {{c1::Press space to reveal, left arrow (←) to mark as review later, and right arrow (→) to mark as correct}}',
    questionOptions: [],
    categoryId: '1T',
    category: {
      subjectCategory: 'Tutorial',
      conceptCategory: 'Basic Controls'
    },
    userResponses: [],
    questionAnswerNotes: ["Press space to reveal, left arrow or A (←) to mark as review later, and right arrow or D (→) to mark as correct. Please note, for multiple choice questions, if you get them wrong you CANNOT mark as correct and MUST press A.", "", "", ""]
  },
  {
    questionType: 'normal',
    id: 'tutorial-2',
    questionContent: 'If I pay a coin, how do I get it back?',
    questionOptions: [
      'Get at least half correct on multiple choice questions',
      'Steal the declaration of Independence',
      "Rob Josh's house",
      'Match with an attending on Tinder'
    ],
    categoryId: '1T',
    category: {
      subjectCategory: 'Tutorial',
      conceptCategory: 'Coins'
    },
    userResponses: [],
    questionAnswerNotes: ["If you get 50%, you get your coin back. If you get 80% correct on multiple choice questions (NOT Flashcards: we don\'t grade flashcards so ALWAYS be honest if you got them right or wrong!) then you can get multiple coins and a favorable review from a patient.", "", "", ""]
  },
  {
    questionType: 'normal',
    id: 'tutorial-3',
    questionContent: 'How do I unlock more subjects?',
    questionOptions: [
      'Go to marketplace and purchase upgrades',
      'Prank call dean of admissions at Rutgers',
      'Email prynce@mymcat.ai',
      'Just cry'
    ],
    categoryId: '1T',
    category: {
      subjectCategory: 'Tutorial',
      conceptCategory: 'Unlocking Subjects'
    },
    userResponses: [],
    questionAnswerNotes: ["You can unlock subjects by going to the marketplace and buying rooms, which expand your clinic and increase your level of care. Click the top right, where it says Patient Level, to buy more rooms."]
  },
  {
    questionType: 'normal',
    id: 'tutorial-4',
    questionContent: 'What subjects do we start with?',
    questionOptions: [
      'Psychology & Sociology',
      'Physics and Chemistry',
      'Biology',
      'Biochemistry'
    ],
    categoryId: '1T',
    category: {
      subjectCategory: 'Tutorial',
      conceptCategory: 'Subjects'
    },
    userResponses: [],
    questionAnswerNotes: ["Psychology/Sociology is the most important one to use Anki on. We use the MilesDown deck mixed with our own cards."]
  },
  {
    questionType: 'normal',
    id: 'tutorial-5',
    questionContent: 'What happens if I see a bug?',
    questionOptions: [
      'Message Kalpso@mymcat.ai or join our discord',
      'Cry again (louder)',
      'Quit medicine and become a hindu monk',
      'Start a rap career'
    ],
    categoryId: '1T',
    category: {
      subjectCategory: 'Tutorial',
      conceptCategory: 'Bug'
    },
    userResponses: [],
    questionAnswerNotes: ["We respond to messages! Just message us and it'll be fixed as soon as humanly possible."]
  },
  {
    questionType: 'flashcard',
    id: 'tutorial-6',
    questionContent: 'Is there spaced repetition? {{c1::We use a modified version of SuperMemoV2, the same one Anki uses, except — over time — we adapt to your learning and forgetting rate.}}',
    questionOptions: [],
    categoryId: '1T',
    category: {
      subjectCategory: 'Tutorial',
      conceptCategory: 'Spaced Repetition'
    },
    userResponses: [],
    questionAnswerNotes: ["We use a modified version of SuperMemoV2, the same one Anki uses, except — over time — we adapt to your learning and forgetting rate."]
  },
  {
    questionType: 'flashcard',
    id: 'tutorial-7',
    questionContent: 'How do you know what flashcards to show me? {{c1::It\'s based on the rooms you have avaliable and your total weakness profile. All reviewed tests, third party materials, quiz answers, go to the same understanding of your knowledge — and therefore, we recommend only the most relevant subjects to you.}}',
    questionOptions: [],
    categoryId: '1T',
    category: {
      subjectCategory: 'Tutorial',
      conceptCategory: 'Flashcards'
    },
    userResponses: [],
    questionAnswerNotes: ["It's based on the rooms you have avaliable and your total weakness profile. All reviewed tests, third party materials, quiz answers, go to the same understanding of your knowledge — and therefore, we recommend only the most relevant subjects to you."]
  },
  {
    questionType: 'flashcard',
    id: 'tutorial-8',
    questionContent: 'This doesn\'t feel like a game yet. I want... {{c1::We\'ve built a lot and are constantly building. Join our discord if you want to enage with our community and ask for more! https://discord.gg/DcHWnEu8Xb. }}',
    questionOptions: [],
    links: ['https://discord.gg/DcHWnEu8Xb'],
    categoryId: '1T',
    category: {
      subjectCategory: 'Tutorial',
      conceptCategory: 'Game'
    },
    userResponses: [],
    questionAnswerNotes: ["We've built a lot and are constantly building. Join our discord if you want to enage with our community and ask for more! https://discord.gg/DcHWnEu8Xb."]
  },
  {
    questionType: 'flashcard',
    id: 'tutorial-9',
    questionContent: 'Wait, what are patients? {{c1::Patients are a score influenced by both how often you visit the clinic and the level your rooms are at. It\'s how we determine your placement on leaderboard rankings! The higher your level, the more patients per day your clinic can treat.}}',
    questionOptions: [],
    categoryId: '1T',
    category: {
      subjectCategory: 'Tutorial',
      conceptCategory: 'Patients'
    },
    userResponses: [],
    questionAnswerNotes: ["Patients are a score influenced by both how often you visit the clinic and the level your rooms are at. It's how we determine your placement on leaderboard rankings! The higher your level, the more patients per day your clinic can treat."]
  },
  {
    questionType: 'flashcard',
    id: 'tutorial-10',
    questionContent: 'Great, now how do I actually get started? {{c1::Right now you\'re on the patient level. To start playing, click the button in the top right to go to the marketplace and purchase the intern level. Once you\'ve leveled up, you can start exploring more rooms and practicing real questions!}}',
    questionOptions: [],
    categoryId: '1T',
    category: {
      subjectCategory: 'Tutorial',
      conceptCategory: 'Getting Started'
    },
    userResponses: [],
    questionAnswerNotes: ["Right now you're on the patient level. To start playing, click the button in the top right to go to the marketplace and purchase the intern level. Once you've leveled up, you can start exploring more rooms and answering medical questions!"]
  }
]; 