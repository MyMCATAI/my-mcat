//constants/uworld.ts
/* Maps UWorld categories to their respective subjects in MyMCAT.ai backend. */
export const uworldMapping: Record<string, string[]> = {
    // Psychology (6A-7C)
    "Sensation, Perception, and Consciousness": ["6A"],  // Maps directly to Sensation, Perception
    "Learning, Memory, and Cognition": ["6B", "7C"],    // Maps to Cognition, Memory and Language, Learning
    "Motivation, Emotion, Attitudes, Personality, and Stress": ["6C", "7A"],  // Maps to Emotions and Stress, Motivation and Attitudes, Personality
    
    // Sociology (8A-10A)
    "Identity and Social Interaction": ["8A", "8C"],    // Maps to Self-Identity, Social Interaction
    "Demographics and Social Structure": ["9A", "9B"],  // Maps to Social Institutions, Demographic Structure
    
    // Biochemistry (1A-1D)
    "Amino Acids and Proteins": ["1A"],     // Maps to Amino Acids, Proteins
    "Enzymes": ["1A", "5E"],               // Maps to Enzymes, Enzyme Kinetics
    "Carbohydrates, Nucleotides, and Lipids": ["5D"],  // Maps to Carbohydrate/Lipid Structure
    "Metabolic Reactions": ["1D"],          // Maps to all metabolism categories
    
    // Biology (2A-3B)
    "Molecular Biology": ["1B"],           // Maps to DNA, RNA, Gene Expression
    "Cellular Biology": ["2A"],            // Maps to The Cell, Plasma Membrane
    "Genetics and Evolution": ["1C"],      // Maps to Evolution, Genetics
    "Reproduction": ["2C", "3B"],          // Maps to Embryogenesis, Reproductive System
    "Endocrine and Nervous Systems": ["3A"], // Maps directly
    "Circulation and Respiration": ["3B"],   // Maps to Respiration and Circulation
    "Digestion and Excretion": ["3B"],      // Maps to Digestion System, Excretion System
    "Musculoskeletal System": ["3B"],       // Maps to Muscular System
    "Skin and Immune Systems": ["3B"],      // Maps to Immune System, Skin and Bones
    
    // CARs
    "Humanities": ["CARs"],
    "Social Sciences": ["CARs"],
    
    // Chemistry (4E-5E)
    "Atomic Theory and Chemical Composition": ["4E"],    // Maps to Atoms, Stoichiometry
    "Interactions of Chemical Substances": ["5B"],       // Maps to Covalent Bonds, Intermolecular Forces
    "Thermodynamics, Kinetics & Gas Laws": ["4B", "5E"], // Maps to Gases, Thermodynamics
    "Solutions and Electrochemistry": ["4C", "5A"],      // Maps to Solutions, Electrochemistry
    
    // Organic Chemistry
    "Introduction to Organic Chemistry": ["5D"],         // Maps to Organic Compounds
    "Functional Groups and Their Reactions": ["5D"],     // Maps to Organic Compounds
    "Separation Techniques, Spectroscopy, and Analytical Methods": ["5C"], // Maps to Separations, Spectroscopy
    
    // Physics
    "Mechanics and Energy": ["4A"],                     // Maps to Energy, Force, Kinematics
    "Fluids": ["4B"],                                  // Maps directly
    "Electrostatics and Circuits": ["4C"],             // Maps to Circuits, Electrostatics
    "Light and Sound": ["4D"]                          // Maps to Light and Optics, Sound and Waves
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