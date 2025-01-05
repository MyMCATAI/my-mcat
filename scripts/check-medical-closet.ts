import prismadb from "../lib/prismadb";

async function checkMedicalClosetQuestions() {
  try {
    // Get the category IDs for Lab Techniques (5C) and Organic Chemistry (5D)
    const categories = await prismadb.category.findMany({
      where: {
        OR: [
          { contentCategory: '5C' },
          { contentCategory: '5D' }
        ]
      }
    });

    console.log('Found categories:', categories);

    // Get questions for these categories
    const questions = await prismadb.question.findMany({
      where: {
        OR: [
          { contentCategory: '5C' },
          { contentCategory: '5D' }
        ]
      },
      include: {
        category: true
      }
    });

    console.log('\nFound questions:', questions.length);
    
    // Log detailed information about each question
    questions.forEach((q, index) => {
      console.log(`\nQuestion ${index + 1}:`);
      console.log('ID:', q.id);
      console.log('Content:', q.questionContent);
      console.log('Type:', q.types);
      console.log('Category:', q.category.subjectCategory);
      console.log('Content Category:', q.contentCategory);
      console.log('Has Options:', q.questionOptions ? 'Yes' : 'No');
      
      // Try to parse question options
      try {
        const options = JSON.parse(q.questionOptions);
        console.log('Options:', options);
      } catch (e) {
        console.log('Options (raw):', q.questionOptions);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prismadb.$disconnect();
  }
}

checkMedicalClosetQuestions(); 