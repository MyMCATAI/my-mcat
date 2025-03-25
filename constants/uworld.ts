//constants/uworld.ts
/* Maps UWorld categories to their respective subjects in MyMCAT.ai backend. */
export const uworldMapping: Record<string, string[]> = {
    // Behavioral Sciences
    "Sensation, Perception, and Consciousness": ["6A", "6B"],
    "Learning, Memory, and Cognition": ["6B", "7C"],
    "Motivation, Emotion, Attitudes, Personality, and Stress": ["6C", "7A"],
    "Identity and Social Interaction": ["8A", "8B", "8C"],
    "Demographics and Social Structure": ["9A", "9B", "10A"],

    // Biochemistry
    "Amino Acids and Proteins": ["1A"],
    "Enzymes": ["1A", "5E"],
    "Carbohydrates, Nucleotides, and Lipids": ["5D"],
    "Metabolic Reactions": ["1D"],
    "Biology": ["2A", "2B"],
    "Molecular Biology": ["1B"],
    "Cellular Biology": ["2A", "2B"],
    "Genetics and Evolution": ["1C"],
    "Reproduction": ["2C", "3B"],
    "Endocrine and Nervous Systems": ["3A"],
    "Circulation and Respiration": ["3B"],
    "Digestion and Excretion": ["3B"],
    "Musculoskeletal System": ["3B"],
    "Skin and Immune Systems": ["3B"],

    // CARs
    "Humanities": ["CARs"],
    "Social Sciences": ["CARs"],

    // General Chemistry
    "Atomic Theory and Chemical Composition": ["4E"],
    "Interactions of Chemical Substances": ["5B"],
    "Thermodynamics, Kinetics & Gas Laws": ["4B", "5E"],
    "Solutions and Electrochemistry": ["4C", "5A"],

    // Organic Chemistry
    "Introduction to Organic Chemistry": ["5D"],
    "Functional Groups and Their Reactions": ["5D"],
    "Separation Techniques, Spectroscopy, and Analytical Methods": ["5C"],

    // Physics
    "Mechanics and Energy": ["4A"],
    "Fluids": ["4B"],
    "Electrostatics and Circuits": ["4C"],
    "Light and Sound": ["4D"]
} as const;

/* Creates a reverse mapping from MyMCAT codes to UWorld topics for bidirectional lookup */
export const reverseUWorldMapping = Object.entries(uworldMapping).reduce((acc, [uworldTopic, mymcatCodes]) => {
    mymcatCodes.forEach(code => {
        if (!acc[code]) acc[code] = [];
        acc[code].push(uworldTopic);
    });
    return acc;
}, {} as Record<string, string[]>);

export const mainUWorldSubjects = [
    "Behavioral Sciences",
    "Biochemistry",
    "Biology",
    "Critical Analysis & Reasoning Skills",
    "General Chemistry",
    "Organic Chemistry",
    "Physics",
]

export const uniqueCategories = Object.keys(uworldMapping);