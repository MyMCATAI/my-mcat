// api/knowledge-profile/update/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

interface SourceWeights {
  aamc: number;
  uworld: number;
  mymcat: number;
}

// Base weights when all sources are available
const BASE_WEIGHTS: SourceWeights = {
  aamc: 0.5,    // AAMC has highest weight
  uworld: 0.3,  // UWorld second
  mymcat: 0.2   // MyMCAT internal questions
};

const TIME_DECAY_FACTOR = 0.1; // Adjust this value to control decay rate

function calculateTimeDecayWeight(answeredAt: Date): number {
  const ageInDays = (Date.now() - answeredAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-TIME_DECAY_FACTOR * ageInDays);
}

function getAdjustedWeights(
  hasAAMC: boolean,
  hasUWorld: boolean,
  hasMyMCAT: boolean
): SourceWeights {
  let weights = { ...BASE_WEIGHTS };
  let totalWeight = 0;

  // Zero out weights for missing sources
  if (!hasAAMC) weights.aamc = 0;
  if (!hasUWorld) weights.uworld = 0;
  if (!hasMyMCAT) weights.mymcat = 0;

  // Calculate total of remaining weights
  totalWeight = weights.aamc + weights.uworld + weights.mymcat;

  // If no sources, default to equal weight for any that exist
  if (totalWeight === 0) {
    const availableSources = [hasAAMC, hasUWorld, hasMyMCAT].filter(Boolean).length;
    if (availableSources === 0) return BASE_WEIGHTS; // Fallback to base weights if somehow nothing exists
    const equalWeight = 1 / availableSources;
    if (hasAAMC) weights.aamc = equalWeight;
    if (hasUWorld) weights.uworld = equalWeight;
    if (hasMyMCAT) weights.mymcat = equalWeight;
    return weights;
  }

  // Normalize remaining weights to sum to 1
  const normalizer = 1 / totalWeight;
  return {
    aamc: weights.aamc * normalizer,
    uworld: weights.uworld * normalizer,
    mymcat: weights.mymcat * normalizer
  };
}

function calculateSourceMastery(
  correct: number,
  incorrect: number,
  weight: number = 1,
  timeWeights: number[] = []
): number {
  if (correct + incorrect === 0) return 0;
  
  // If no time weights provided, use equal weights
  const weights = timeWeights.length > 0 ? timeWeights : Array(correct + incorrect).fill(1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // Normalize weights to sum to 1
  const normalizedWeights = weights.map(w => w / totalWeight);
  
  // Calculate weighted mastery
  const mastery = (correct / (correct + incorrect)) * weight;
  
  return mastery;
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Define the subject/content/concept mapping from the CSV data
    const subjectContentConceptMapping = [
      { subjectCategory: "Biochemistry", contentCategory: "1A", conceptCategory: "Amino Acids" },
      { subjectCategory: "Biochemistry", contentCategory: "1A", conceptCategory: "Enzymes" },
      { subjectCategory: "Biochemistry", contentCategory: "1A", conceptCategory: "Proteins" },
      { subjectCategory: "Biochemistry", contentCategory: "1B", conceptCategory: "DNA and Biotechnology" },
      { subjectCategory: "Biochemistry", contentCategory: "1B", conceptCategory: "Eukaryotic Gene Expression" },
      { subjectCategory: "Biochemistry", contentCategory: "1B", conceptCategory: "RNA and The Central Dogma" },
      { subjectCategory: "Biochemistry", contentCategory: "1C", conceptCategory: "Evolution" },
      { subjectCategory: "Biochemistry", contentCategory: "1C", conceptCategory: "Genetics" },
      { subjectCategory: "Biochemistry", contentCategory: "1C", conceptCategory: "Meiosis and Genetic Diversity" },
      { subjectCategory: "Biochemistry", contentCategory: "1D", conceptCategory: "Aerobic Respiration" },
      { subjectCategory: "Biochemistry", contentCategory: "1D", conceptCategory: "Bioenergetics and Regulation of Metabolism" },
      { subjectCategory: "Biochemistry", contentCategory: "1D", conceptCategory: "Glycolysis, Glycogen, Gluconeogenesis, and The Pentose Phosphate Pathway" },
      { subjectCategory: "Biochemistry", contentCategory: "1D", conceptCategory: "Lipid and Amino Acid Metabolism" },
      { subjectCategory: "Biology", contentCategory: "2A", conceptCategory: "Plasma Membrane" },
      { subjectCategory: "Biology", contentCategory: "2A", conceptCategory: "The Cell" },
      { subjectCategory: "Biology", contentCategory: "2B", conceptCategory: "Prokaryotes" },
      { subjectCategory: "Biology", contentCategory: "2B", conceptCategory: "Viruses" },
      { subjectCategory: "Biology", contentCategory: "2C", conceptCategory: "Embryogenesis" },
      { subjectCategory: "Biology", contentCategory: "2C", conceptCategory: "Mitosis" },
      { subjectCategory: "Biology", contentCategory: "3A", conceptCategory: "Endocrine System" },
      { subjectCategory: "Biology", contentCategory: "3A", conceptCategory: "Nervous System" },
      { subjectCategory: "Biology", contentCategory: "3B", conceptCategory: "Digestion System" },
      { subjectCategory: "Biology", contentCategory: "3B", conceptCategory: "Excretion System" },
      { subjectCategory: "Biology", contentCategory: "3B", conceptCategory: "Immune System" },
      { subjectCategory: "Biology", contentCategory: "3B", conceptCategory: "Muscular System" },
      { subjectCategory: "Biology", contentCategory: "3B", conceptCategory: "Reproductive System" },
      { subjectCategory: "Biology", contentCategory: "3B", conceptCategory: "Respiration and Circulation" },
      { subjectCategory: "Biology", contentCategory: "3B", conceptCategory: "Skin and Bones" },
      { subjectCategory: "CARs", contentCategory: "CARs", conceptCategory: "Foundations of Comprehension" },
      { subjectCategory: "CARs", contentCategory: "CARs", conceptCategory: "Reasoning Beyond the Text" },
      { subjectCategory: "CARs", contentCategory: "CARs", conceptCategory: "Reasoning Within the Text" },
      { subjectCategory: "Chemistry", contentCategory: "4E", conceptCategory: "Atoms" },
      { subjectCategory: "Chemistry", contentCategory: "4E", conceptCategory: "Periodic Trends" },
      { subjectCategory: "Chemistry", contentCategory: "4E", conceptCategory: "Stoichiometry" },
      { subjectCategory: "Chemistry", contentCategory: "5A", conceptCategory: "Acid-Base" },
      { subjectCategory: "Chemistry", contentCategory: "5A", conceptCategory: "Solutions" },
      { subjectCategory: "Chemistry", contentCategory: "5B", conceptCategory: "Covalent Bonds" },
      { subjectCategory: "Chemistry", contentCategory: "5B", conceptCategory: "Intermolecular Forces" },
      { subjectCategory: "Chemistry", contentCategory: "5C", conceptCategory: "Seperations and Purifications" },
      { subjectCategory: "Chemistry", contentCategory: "5C", conceptCategory: "Spectroscopy" },
      { subjectCategory: "Chemistry", contentCategory: "5D", conceptCategory: "Carbohydrate Structure and Function" },
      { subjectCategory: "Chemistry", contentCategory: "5D", conceptCategory: "Lipid Structure and Function" },
      { subjectCategory: "Chemistry", contentCategory: "5D", conceptCategory: "Organic Compounds" },
      { subjectCategory: "Chemistry", contentCategory: "5E", conceptCategory: "Enzyme Kinetics" },
      { subjectCategory: "Chemistry", contentCategory: "5E", conceptCategory: "Equilibrium" },
      { subjectCategory: "Chemistry", contentCategory: "5E", conceptCategory: "Thermodynamics and Thermochemistry" },
      { subjectCategory: "Physics", contentCategory: "4A", conceptCategory: "Energy" },
      { subjectCategory: "Physics", contentCategory: "4A", conceptCategory: "Force" },
      { subjectCategory: "Physics", contentCategory: "4A", conceptCategory: "Kinematics" },
      { subjectCategory: "Physics", contentCategory: "4B", conceptCategory: "Fluids" },
      { subjectCategory: "Physics", contentCategory: "4B", conceptCategory: "Gases" },
      { subjectCategory: "Physics", contentCategory: "4C", conceptCategory: "Circuits" },
      { subjectCategory: "Physics", contentCategory: "4C", conceptCategory: "Electrochemistry" },
      { subjectCategory: "Physics", contentCategory: "4C", conceptCategory: "Electrostatics and Magnetism" },
      { subjectCategory: "Physics", contentCategory: "4D", conceptCategory: "Light and Optics" },
      { subjectCategory: "Physics", contentCategory: "4D", conceptCategory: "Sound and Waves" },
      { subjectCategory: "Psychology", contentCategory: "6A", conceptCategory: "Perception" },
      { subjectCategory: "Psychology", contentCategory: "6A", conceptCategory: "Sensation" },
      { subjectCategory: "Psychology", contentCategory: "6B", conceptCategory: "Cognition" },
      { subjectCategory: "Psychology", contentCategory: "6B", conceptCategory: "Memory and Language" },
      { subjectCategory: "Psychology", contentCategory: "6C", conceptCategory: "Emotions and Stress" },
      { subjectCategory: "Psychology", contentCategory: "7A", conceptCategory: "Biology and Behavior" },
      { subjectCategory: "Psychology", contentCategory: "7A", conceptCategory: "Motivation and Attitudes" },
      { subjectCategory: "Psychology", contentCategory: "7A", conceptCategory: "Personality" },
      { subjectCategory: "Psychology", contentCategory: "7B", conceptCategory: "Social Processes on Communities" },
      { subjectCategory: "Psychology", contentCategory: "7B", conceptCategory: "Social Processes on Individuals" },
      { subjectCategory: "Psychology", contentCategory: "7C", conceptCategory: "Attitude and Behavior Change" },
      { subjectCategory: "Psychology", contentCategory: "7C", conceptCategory: "Learning" },
      { subjectCategory: "Sociology", contentCategory: "10A", conceptCategory: "Social Stratification" },
      { subjectCategory: "Sociology", contentCategory: "8A", conceptCategory: "Self-Identity" },
      { subjectCategory: "Sociology", contentCategory: "8B", conceptCategory: "Attribution" },
      { subjectCategory: "Sociology", contentCategory: "8B", conceptCategory: "Stereotypes and Bias" },
      { subjectCategory: "Sociology", contentCategory: "8C", conceptCategory: "Self Presentation" },
      { subjectCategory: "Sociology", contentCategory: "8C", conceptCategory: "Social Interaction" },
      { subjectCategory: "Sociology", contentCategory: "9A", conceptCategory: "Culture" },
      { subjectCategory: "Sociology", contentCategory: "9A", conceptCategory: "Social Institutions" },
      { subjectCategory: "Sociology", contentCategory: "9B", conceptCategory: "Demographic Shift" },
      { subjectCategory: "Sociology", contentCategory: "9B", conceptCategory: "Demographic Structure" }
    ];
    
    // Create a set of all concept categories for quick lookup
    const allConceptCategories = new Set(
      subjectContentConceptMapping.map(mapping => mapping.conceptCategory)
    );

    // Get all user responses for the current user
    const userResponses = await prisma.userResponse.findMany({
      where: {
        userTest: {
          userId: userId
        },
        categoryId: { not: null }
      },
      include: {
        Category: {
          select: {
            id: true,
            contentCategory: true,
            conceptCategory: true
          }
        }
      }
    }); 

    // Get all data pulses for the user
    const dataPulses = await prisma.dataPulse.findMany({
      where: {
        userId: userId
      }
    });

    // Group responses by concept category (for concept mastery)
    const groupedResponses = userResponses.reduce((acc, response) => {
      if (!acc[response.categoryId!]) {
        acc[response.categoryId!] = [];
      }
      acc[response.categoryId!].push(response);
      return acc;
    }, {} as Record<string, typeof userResponses>);

    // Group responses by content category
    const contentGroupedResponses = userResponses.reduce((acc, response) => {
      const contentCategory = response.Category!.contentCategory;
      if (!acc[contentCategory]) {
        acc[contentCategory] = [];
      }
      acc[contentCategory].push(response);
      return acc;
    }, {} as Record<string, typeof userResponses>);

    // Group data pulses by content category, filtering out any that match concept categories
    const contentGroupedPulses = dataPulses.reduce((acc, pulse) => {
      // Skip if pulse.name is a concept category
      if (allConceptCategories.has(pulse.name)) {
        return acc;
      }
      
      if (!acc[pulse.name]) {
        acc[pulse.name] = {
          aamc: { positive: 0, negative: 0 },
          uworld: { positive: 0, negative: 0 }
        };
      }
      
      if (pulse.source.toLowerCase().includes('aamc')) {
        acc[pulse.name].aamc.positive += pulse.positive;
        acc[pulse.name].aamc.negative += pulse.negative;
      } else if (pulse.source.toLowerCase().includes('uworld')) {
        acc[pulse.name].uworld.positive += pulse.positive;
        acc[pulse.name].uworld.negative += pulse.negative;
      }
      
      return acc;
    }, {} as Record<string, { 
      aamc: { positive: number, negative: number },
      uworld: { positive: number, negative: number }
    }>);

    // Process DataPulses with level="contentCategory"
    const contentCategoryMasteries: Record<string, any> = {};

    if (contentGroupedPulses['contentCategory']) {
      // Use type assertion to tell TypeScript the structure of the data
      const typedCategoryData = contentGroupedPulses['contentCategory'] as Record<string, {
        aamc: { positive: number, negative: number },
        uworld: { positive: number, negative: number }
      }>;
      
      Object.entries(typedCategoryData).forEach(([contentCategory, sources]) => {
        // Initialize content mastery structure if not exists
        if (!contentCategoryMasteries[contentCategory]) {
          contentCategoryMasteries[contentCategory] = {
            mymcat: { mastery: 0, weight: BASE_WEIGHTS.mymcat },
            aamc: { mastery: 0, weight: BASE_WEIGHTS.aamc },
            uworld: { mastery: 0, weight: BASE_WEIGHTS.uworld },
            other: { mastery: 0, weight: 0 },
            finalMastery: 0
          };
        }
        
        // Calculate mastery for each source
        if (sources.aamc && sources.aamc.positive + sources.aamc.negative > 0) {
          contentCategoryMasteries[contentCategory].aamc.mastery = 
            sources.aamc.positive / (sources.aamc.positive + sources.aamc.negative);
        }
        
        if (sources.uworld && sources.uworld.positive + sources.uworld.negative > 0) {
          contentCategoryMasteries[contentCategory].uworld.mastery = 
            sources.uworld.positive / (sources.uworld.positive + sources.uworld.negative);
        }
      });
    }

    // Add MyMCAT data to content masteries
    // Create a typed version of contentGroupedResponses
    const typedContentResponses = contentGroupedResponses as Record<string, any[]>;
    
    Object.entries(typedContentResponses).forEach(([contentCategory, responses]) => {
      // Initialize if not already present
      if (!contentCategoryMasteries[contentCategory]) {
        contentCategoryMasteries[contentCategory] = {
          mymcat: { mastery: 0, weight: BASE_WEIGHTS.mymcat },
          aamc: { mastery: 0, weight: BASE_WEIGHTS.aamc },
          uworld: { mastery: 0, weight: BASE_WEIGHTS.uworld },
          other: { mastery: 0, weight: 0 },
          finalMastery: 0
        };
      }
      
      // Calculate MyMCAT mastery
      const mymcatCorrect = responses.filter(r => r.isCorrect).length;
      const mymcatTotal = responses.length;
      
      if (mymcatTotal > 0) {
        contentCategoryMasteries[contentCategory].mymcat.mastery = 
          mymcatCorrect / mymcatTotal;
      }
    });

    // Calculate final weighted content mastery scores
    Object.entries(contentCategoryMasteries).forEach(([contentCategory, data]: [string, any]) => {
      // Determine which sources are available
      const hasAAMC = data.aamc.mastery > 0;
      const hasUWorld = data.uworld.mastery > 0;
      const hasMyMCAT = data.mymcat.mastery > 0;
      
      // Get adjusted weights based on available sources
      const weights = getAdjustedWeights(hasAAMC, hasUWorld, hasMyMCAT);
      
      // Calculate weighted mastery
      const finalMastery = 
        (data.mymcat.mastery * weights.mymcat) +
        (data.aamc.mastery * weights.aamc) +
        (data.uworld.mastery * weights.uworld);
      
      contentCategoryMasteries[contentCategory].finalMastery = finalMastery;
    });

    // Process DataPulses with level="conceptCategory"
    const conceptCategoryMasteries = {};
    const conceptToContentMap = {}; // Maps concept categories to their parent content categories

    // First, build the concept-to-content mapping from user responses
    userResponses.forEach(response => {
      if (response.Category?.conceptCategory && response.Category?.contentCategory) {
        conceptToContentMap[response.Category.conceptCategory] = response.Category.contentCategory;
      }
    });

    // Also add mappings from the provided subject/content/concept mapping
    // (This would come from your unique-values.csv data)
    subjectContentConceptMapping.forEach(mapping => {
      conceptToContentMap[mapping.conceptCategory] = mapping.contentCategory;
    });

    /* Comment out DataPulse processing for concept categories
    // Process concept category DataPulses
    if (groupedPulses['conceptCategory']) {
      Object.entries(groupedPulses['conceptCategory']).forEach(([conceptCategory, sources]) => {
        // Initialize concept mastery structure if not exists
        if (!conceptCategoryMasteries[conceptCategory]) {
          conceptCategoryMasteries[conceptCategory] = {
            mymcat: { mastery: 0, weight: BASE_WEIGHTS.mymcat },
            aamc: { mastery: 0, weight: BASE_WEIGHTS.aamc },
            uworld: { mastery: 0, weight: BASE_WEIGHTS.uworld },
            other: { mastery: 0, weight: 0 },
            finalMastery: 0,
            contentCategory: conceptToContentMap[conceptCategory] || null
          };
        }
        
        // Calculate mastery for each source
        if (sources.aamc && sources.aamc.positive + sources.aamc.negative > 0) {
          conceptCategoryMasteries[conceptCategory].aamc.mastery = 
            sources.aamc.positive / (sources.aamc.positive + sources.aamc.negative);
        }
        
        if (sources.uworld && sources.uworld.positive + sources.uworld.negative > 0) {
          conceptCategoryMasteries[conceptCategory].uworld.mastery = 
            sources.uworld.positive / (sources.uworld.positive + sources.uworld.negative);
        }
      });
    }
    */

    // Add MyMCAT data to concept masteries with time decay
    const conceptGroupedResponses = userResponses.reduce((acc, response) => {
      const conceptCategory = response.Category?.conceptCategory;
      if (!conceptCategory) return acc;
      
      if (!acc[conceptCategory]) {
        acc[conceptCategory] = [];
      }
      acc[conceptCategory].push(response);
      return acc;
    }, {} as Record<string, any[]>);

    // Create a typed version of conceptGroupedResponses
    const typedConceptResponses = conceptGroupedResponses as Record<string, any[]>;
    
    Object.entries(typedConceptResponses).forEach(([conceptCategory, responses]) => {
      // Initialize if not already present
      if (!conceptCategoryMasteries[conceptCategory]) {
        conceptCategoryMasteries[conceptCategory] = {
          mymcat: { mastery: 0, weight: 1 }, // Use weight 1 since we're only using MyMCAT data
          finalMastery: 0,
          contentCategory: conceptToContentMap[conceptCategory] || null
        };
      }
      
      // Calculate time weights
      const timeWeights = responses.map(r => calculateTimeDecayWeight(r.answeredAt));
      
      // Calculate weighted correct/incorrect
      const weightedCorrect = responses
        .filter(r => r.isCorrect)
        .reduce((sum, _, i) => sum + timeWeights[i], 0);
      
      const weightedIncorrect = responses
        .filter(r => !r.isCorrect)
        .reduce((sum, _, i) => sum + timeWeights[i], 0);
      
      const totalWeighted = weightedCorrect + weightedIncorrect;
      
      if (totalWeighted > 0) {
        const mymcatMastery = weightedCorrect / totalWeighted;
        conceptCategoryMasteries[conceptCategory].mymcat.mastery = mymcatMastery;
        // Since we're only using MyMCAT data, the final mastery is the same as MyMCAT mastery
        conceptCategoryMasteries[conceptCategory].finalMastery = mymcatMastery;
      }
    });

    /* Comment out the weighted concept mastery calculation since we're only using MyMCAT data
    // Calculate final weighted concept mastery scores
    Object.entries(conceptCategoryMasteries).forEach(([conceptCategory, data]) => {
      // Determine which sources are available
      const hasAAMC = data.aamc.mastery > 0;
      const hasUWorld = data.uworld.mastery > 0;
      const hasMyMCAT = data.mymcat.mastery > 0;
      
      // Get adjusted weights based on available sources
      const weights = getAdjustedWeights(hasAAMC, hasUWorld, hasMyMCAT);
      
      // Calculate weighted mastery
      const finalMastery = 
        (data.mymcat.mastery * weights.mymcat) +
        (data.aamc.mastery * weights.aamc) +
        (data.uworld.mastery * weights.uworld);
      
      conceptCategoryMasteries[conceptCategory].finalMastery = finalMastery;
    });
    */

    /* Comment out content-concept relationship processing
    // Group concept categories by content category
    const contentToConceptsMap = {};

    Object.entries(conceptCategoryMasteries).forEach(([conceptCategory, data]) => {
      const contentCategory = data.contentCategory;
      if (!contentCategory) return;
      
      if (!contentToConceptsMap[contentCategory]) {
        contentToConceptsMap[contentCategory] = [];
      }
      
      contentToConceptsMap[contentCategory].push({
        conceptCategory,
        mastery: data.finalMastery
      });
    });

    // Update content category masteries based on concept categories
    Object.entries(contentToConceptsMap).forEach(([contentCategory, concepts]) => {
      // If we don't have direct content category data, initialize it
      if (!contentCategoryMasteries[contentCategory]) {
        contentCategoryMasteries[contentCategory] = {
          mymcat: { mastery: 0, weight: BASE_WEIGHTS.mymcat },
          aamc: { mastery: 0, weight: BASE_WEIGHTS.aamc },
          uworld: { mastery: 0, weight: BASE_WEIGHTS.uworld },
          other: { mastery: 0, weight: 0 },
          finalMastery: 0
        };
      }
      
      // Calculate average mastery from concept categories
      const totalMastery = concepts.reduce((sum, concept) => sum + concept.mastery, 0);
      const averageConceptMastery = totalMastery / concepts.length;
      
      // If we already have direct content mastery data, blend it with concept-derived mastery
      // Otherwise, just use the concept-derived mastery
      if (contentCategoryMasteries[contentCategory].finalMastery > 0) {
        // Blend direct content mastery (70%) with concept-derived mastery (30%)
        contentCategoryMasteries[contentCategory].finalMastery = 
          (contentCategoryMasteries[contentCategory].finalMastery * 0.7) + 
          (averageConceptMastery * 0.3);
      } else {
        contentCategoryMasteries[contentCategory].finalMastery = averageConceptMastery;
      }
    });
    */

    // Update knowledge profiles
    const updatePromises: any[] = [];

    // Update profiles for categories with user responses
    // Create a typed version of groupedResponses
    const typedGroupedResponses = groupedResponses as Record<string, any[]>;
    
    Object.entries(typedGroupedResponses).forEach(([categoryId, responses]) => {
      // Get category information
      const category = responses[0].Category;
      const contentCategory = category.contentCategory;
      const conceptCategory = category.conceptCategory;
      
      // Get latest response
      const latestResponse = responses.reduce((latest, current) => 
        latest.answeredAt > current.answeredAt ? latest : current
      );
      
      // Get mastery scores
      const contentMastery = contentCategoryMasteries[contentCategory]?.finalMastery || 0;
      const conceptMastery = conceptCategoryMasteries[conceptCategory]?.finalMastery || 0;
      
      // Update knowledge profile
      updatePromises.push(
        prisma.knowledgeProfile.upsert({
          where: {
            userId_categoryId: {
              userId: userId,
              categoryId: categoryId,
            },
          },
          update: {
            correctAnswers: responses.filter(r => r.isCorrect).length,
            totalAttempts: responses.length,
            lastAttemptAt: latestResponse.answeredAt,
            conceptMastery: conceptMastery,
            contentMastery: contentMastery,
            lastUpdatedAt: new Date()
          },
          create: {
            userId: userId,
            categoryId: categoryId,
            correctAnswers: responses.filter(r => r.isCorrect).length,
            totalAttempts: responses.length,
            lastAttemptAt: latestResponse.answeredAt,
            conceptMastery: conceptMastery,
            contentMastery: contentMastery,
            lastUpdatedAt: new Date()
          },
        })
      );
    });

    // Also update profiles for categories that only have DataPulse data
    // (no direct user responses)
    // const categoryMap = await prisma.category.findMany();
    // const categoryLookup = {};

    // // Build lookup maps
    // categoryMap.forEach(category => {
    //   // Map content category to category ID
    //   if (!categoryLookup[category.contentCategory]) {
    //     categoryLookup[category.contentCategory] = [];
    //   }
    //   categoryLookup[category.contentCategory].push(category.id);
      
    //   // Map concept category to category ID
    //   if (!categoryLookup[category.conceptCategory]) {
    //     categoryLookup[category.conceptCategory] = [];
    //   }
    //   categoryLookup[category.conceptCategory].push(category.id);
    // });

    // // Update profiles for content categories with only DataPulse data
    // Object.entries(contentCategoryMasteries).forEach(([contentCategory, data]) => {
    //   const categoryIds = categoryLookup[contentCategory] || [];
      
    //   categoryIds.forEach(categoryId => {
    //     // Skip if we already processed this category
    //     if (groupedResponses[categoryId]) return;
        
    //     // Find concept category for this category ID
    //     const category = categoryMap.find(c => c.id === categoryId);
    //     if (!category) return;
        
    //     const conceptMastery = conceptCategoryMasteries[category.conceptCategory]?.finalMastery || 0;
        
    //     // Update knowledge profile
    //     updatePromises.push(
    //       prisma.knowledgeProfile.upsert({
    //         where: {
    //           userId_categoryId: {
    //             userId: userId,
    //             categoryId: categoryId,
    //           },
    //         },
    //         update: {
    //           contentMastery: data.finalMastery,
    //           conceptMastery: conceptMastery,
    //           lastUpdatedAt: new Date()
    //         },
    //         create: {
    //           userId: userId,
    //           categoryId: categoryId,
    //           correctAnswers: 0,
    //           totalAttempts: 0,
    //           lastAttemptAt: new Date(),
    //           contentMastery: data.finalMastery,
    //           conceptMastery: conceptMastery,
    //           lastUpdatedAt: new Date()
    //         },
    //       })
    //     );
    //   });
    // });

    // Execute all updates
    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Knowledge profiles updated successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error updating knowledge profiles:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}