export const cleanQuestion = (text: string): string => {
    const cleanedContent = text.replace(/\.\.\.[^}]*(?=}})/g, '');
    const answerMatches = cleanedContent.replace(/{{c1::(.*?)}}/g, '_________');
    const finalAnswer = answerMatches.replace(/{{c1::|}}/g, '')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .trim();
    return finalAnswer;
};

export const cleanAnswer = (text: string): string => {
    const matches = [...text.matchAll(/{{c[^:]*::(.+?)(?=::|}})/g)];
    const result = matches.map(match => match[1]).join(', ');

    return result
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .trim();
}; 