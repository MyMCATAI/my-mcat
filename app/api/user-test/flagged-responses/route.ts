import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userTestId, questionId, flagged } = req.body;

  try {
    // Check if the UserResponse exists or create a new one
    let userResponse = await prisma.userResponse.findFirst({
      where: { userTestId, questionId },
    });

    if (!userResponse) {
      userResponse = await prisma.userResponse.create({
        data: {
          userTestId,
          questionId,
          flagged: false,
          userAnswer: '',
          isCorrect: false,
          question: { connect: { id: questionId } }
        },
      });
    }

    // Update the flagged status
    userResponse = await prisma.userResponse.update({
      where: { id: userResponse.id },
      data: { flagged },
    });

    return res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error handling user response:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
