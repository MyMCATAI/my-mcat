export interface Tutor {
  name: string;
  university: string;
  stars: number;
  reviews: number;
  price: number;
}

export const tutors: Tutor[] = [
  { name: "Chas B.", university: "Yale University", stars: 5, reviews: 2, price: 150 },
  { name: "Vivian Z.", university: "MS1 at California MD", stars: 5, reviews: 12, price: 150 },
  { name: "Saanvi A.", university: "New York University", stars: 5, reviews: 3, price: 150 },
  { name: "Ethan K.", university: "Univ of Pennsylvania", stars: 4.5, reviews: 8, price: 150 }
];

export const tutorExpertise: Record<string, string[]> = {
  "Vivian Z.": ["Advising"],
  "Prynce K.": ["CARS"],
  "Saanvi A.": ["P/S"],
  "Ethan K.": ["B/B", "CARS"],
  "Chas B.": ["C/P", "B/B", "P/S"]
};

export const getTutorDescription = (tutorName: string): string => {
  switch (tutorName) {
    case "Vivian Z.":
      return "Hi everyone! I'm Vivian and I'm an MS1. I improved my MCAT score from 495 to 512 by implementing major changes in content review, mindset, self-criticism, and thorough review. I'd love to help you find the strategies and schedule that work best for you to reach your goal score. I also offer advice on med school applications, including personal statements, secondaries, interview prep, and general questions. In my free time, I enjoy Arcane, Attack on Titan, Fortnite, and Maplestory.";
    case "Saanvi A.":
      return "I'm Saanvi. My MCAT journey was a bit unconventional and a little embarassing: I actually scored a 492 on my first exam. Eventually, I worked hard to earn a 516 but I learned A LOT about what you should and shouldn't do. I really like working with non-trad students since I emphathize with the struggles you face. Recently, I graduated NYU and work as a Clinic Research Coordinator at Einstein.";
    case "Ethan K.":
      return "I'm a grad student at UPenn and I'm passionate about helping others succeed in CARs and Bio/Biochem. With my 525 score, I've developed a range of strategies to tackle the toughest passages and questions, and I'd love to share them with you. Let's work together to master the MCAT.";
    case "Chas B.":
      return "Hi, I'm Chas! I graduated Summa Cum Laude and Phi Beta Kappa from Yale University in May 2024. My academic background spans the full pre-med curriculum, including inorganic chemistry, organic chemistry, biochemistry, and physics, along with extensive coursework in earth sciences and evolutionary biology. I self-studied for the MCAT over one semester, achieving a score of 526 with perfect scores in three out of four sections (132 CP / 130 CARS / 132 BB / 132 PS). I bring over five years of tutoring experience across a wide range of subjects, from 1st to 12th-grade Math, Science, and English to ACT and SAT preparation. Tutoring is a true passion of mine—I love helping students master concepts that once felt out of reach.";
    default:
      return "This tutor boasts a unique and spirited teaching style with its own fascinating history. From its origins to its current incarnation, the tutor embodies the values, traditions, and spirit of the institution. It serves as a rallying point for students, alumni, and fans, creating a sense of unity and pride on campus and beyond.";
  }
}; 