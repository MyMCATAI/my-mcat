export interface ImageItem {
  id: string;
  src: string;
}

export interface ImageGroup {
  name: string;
  items: ImageItem[];
  cost: number;
  benefits: string[];
}

export const imageGroups: ImageGroup[] = [
  {
    name: "INTERN LEVEL",
    items: [
      {
        id: "ExaminationRoom1",
        src: "/game-components/ExaminationRoom1.png",
      },
      { id: "WaitingRoom1", src: "/game-components/WaitingRoom1.png" },
      { id: "DoctorsOffice1", src: "/game-components/DoctorsOffice1.png" },
    ],
    cost: 1,
    benefits: [
      "You are an intern learning the ropes.",
      "Psychology",
      "Sociology"
    ],
  },
  {
    name: "RESIDENT LEVEL",
    items: [
      {
        id: "ExaminationRoom2",
        src: "/game-components/ExaminationRoom1.png",
      },
      { id: "Bathroom1", src: "/game-components/Bathroom1.png" },
      { id: "Bathroom2", src: "/game-components/Bathroom1.png" },
    ],
    cost: 8,
    benefits: [
      "You are a doctor in training with Kalypso.",
      "Biology"
    ],
  },
  {
    name: "FELLOWSHIP LEVEL",
    items: [
      { id: "HighCare1", src: "/game-components/HighCare1.png" },
      { id: "HighCare2", src: "/game-components/HighCare1.png" },
    ],
    cost: 12,
    benefits: [
      "You are a physician.",
      "Advanced Biology"
    ],
  },
  {
    name: "ATTENDING LEVEL",
    items: [
      { id: "OperatingRoom1", src: "/game-components/OperatingRoom1.png" },
      { id: "MedicalCloset1", src: "/game-components/MedicalCloset1.png" },
      { id: "MRIMachine2", src: "/game-components/MRIMachine.png" },
    ],
    cost: 16,
    benefits: [
      "You can do surgeries.",
      "Biochemistry"
    ],
  },
  {
    name: "PHYSICIAN LEVEL",
    items: [{ id: "MRIMachine1", src: "/game-components/MRIMachine.png" }],
    cost: 20,
    benefits: [
      "You can lead teams.",
      "Physics",
      "Chemistry"
    ],
  },
  {
    name: "MEDICAL DIRECTOR LEVEL",
    items: [
      { id: "CATScan1", src: "/game-components/CATScan1.png" },
      { id: "CATScan2", src: "/game-components/CATScan1.png" },
    ],
    cost: 24,
    benefits: [
      "You are now renowned.",
      "Advanced Chemistry",
      "Advanced Physics"
    ],
  }
]; 