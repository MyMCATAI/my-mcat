const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
// Regular expressions to detect LaTeX content
const latexPatterns = [
    /\$\$(.*?)\$\$/g, // Display math: $$...$$
    /\$(.*?)\$/g, // Inline math: $...$
    /\\begin\{(.*?)\}(.*?)\\end\{\1\}/gs, // Environment: \begin{...}...\end{...}
    /\\(?!n|r|t)[a-zA-Z]+(\{.*?\}|\[.*?\])*(\{.*?\}|\[.*?\])*/g, // LaTeX commands: \command{...} (excluding \n, \r, \t)
];
// Function to check if a string contains LaTeX content
function containsLatex(text) {
    if (!text)
        return false;
    return latexPatterns.some(pattern => pattern.test(text));
}
// Function to extract LaTeX content from a string
function extractLatex(text) {
    if (!text)
        return [];
    const matches = [];
    latexPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            matches.push(match[0]);
        }
    });
    // Filter out common escape sequences that aren't LaTeX
    return matches.filter(match => !(/^\\[nrt]$/.test(match)) // Exclude standalone \n, \r, \t
    );
}
async function main() {
    console.log('Checking for LaTeX content in Question model objects...');
    // Get all questions
    const questions = await prisma.question.findMany({
        select: {
            id: true,
            questionID: true,
            questionContent: true,
            questionOptions: true,
            questionAnswerNotes: true,
        }
    });
    console.log(`Found ${questions.length} questions in the database.`);
    // Initialize counters
    let totalWithLatex = 0;
    let contentWithLatex = 0;
    let optionsWithLatex = 0;
    let notesWithLatex = 0;
    // Results storage
    const questionsWithLatex = [];
    // Check each question
    for (const question of questions) {
        let contentLatexMatches = extractLatex(question.questionContent);
        let optionsLatexMatches = extractLatex(question.questionOptions);
        let notesLatexMatches = extractLatex(question.questionAnswerNotes);
        const hasLatexInContent = contentLatexMatches.length > 0;
        const hasLatexInOptions = optionsLatexMatches.length > 0;
        const hasLatexInNotes = notesLatexMatches.length > 0;
        if (hasLatexInContent || hasLatexInOptions || hasLatexInNotes) {
            totalWithLatex++;
            const questionWithLatex = {
                id: question.id,
                questionID: question.questionID,
            };
            if (hasLatexInContent) {
                contentWithLatex++;
                questionWithLatex.contentLatex = contentLatexMatches;
            }
            if (hasLatexInOptions) {
                optionsWithLatex++;
                questionWithLatex.optionsLatex = optionsLatexMatches;
            }
            if (hasLatexInNotes) {
                notesWithLatex++;
                questionWithLatex.notesLatex = notesLatexMatches;
            }
            questionsWithLatex.push(questionWithLatex);
        }
    }
    // Print summary
    console.log('\n--- SUMMARY ---');
    console.log(`Total questions with LaTeX: ${totalWithLatex} (${((totalWithLatex / questions.length) * 100).toFixed(2)}%)`);
    console.log(`Questions with LaTeX in content: ${contentWithLatex}`);
    console.log(`Questions with LaTeX in options: ${optionsWithLatex}`);
    console.log(`Questions with LaTeX in notes: ${notesWithLatex}`);
    // Print detailed results
    console.log('\n--- DETAILED RESULTS ---');
    if (questionsWithLatex.length > 0) {
        console.log('First 10 questions with LaTeX content:');
        questionsWithLatex.slice(0, 10).forEach((q, index) => {
            console.log(`\n${index + 1}. Question ID: ${q.questionID}`);
            if (q.contentLatex) {
                console.log('  Content LaTeX:');
                q.contentLatex.slice(0, 3).forEach(latex => {
                    console.log(`    ${latex.substring(0, 100)}${latex.length > 100 ? '...' : ''}`);
                });
                if (q.contentLatex.length > 3) {
                    console.log(`    ... and ${q.contentLatex.length - 3} more`);
                }
            }
            if (q.optionsLatex) {
                console.log('  Options LaTeX:');
                q.optionsLatex.slice(0, 3).forEach(latex => {
                    console.log(`    ${latex.substring(0, 100)}${latex.length > 100 ? '...' : ''}`);
                });
                if (q.optionsLatex.length > 3) {
                    console.log(`    ... and ${q.optionsLatex.length - 3} more`);
                }
            }
            if (q.notesLatex) {
                console.log('  Notes LaTeX:');
                q.notesLatex.slice(0, 3).forEach(latex => {
                    console.log(`    ${latex.substring(0, 100)}${latex.length > 100 ? '...' : ''}`);
                });
                if (q.notesLatex.length > 3) {
                    console.log(`    ... and ${q.notesLatex.length - 3} more`);
                }
            }
        });
        if (questionsWithLatex.length > 10) {
            console.log(`\n... and ${questionsWithLatex.length - 10} more questions with LaTeX content`);
        }
        // Save results to a file
        fs.writeFileSync('latex-questions-report.json', JSON.stringify(questionsWithLatex, null, 2));
        console.log('\nFull results saved to latex-questions-report.json');
    }
    else {
        console.log('No questions with LaTeX content found.');
    }
}
main()
    .catch(e => {
    console.error('Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
