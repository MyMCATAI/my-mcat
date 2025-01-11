import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { contentCategories } = await req.json();

        if (!contentCategories || !Array.isArray(contentCategories)) {
            return NextResponse.json({ error: "Invalid content categories" }, { status: 400 });
        }

        // Get categories with their knowledge profiles
        const categories = await prisma.category.findMany({
            where: {
                contentCategory: {
                    in: contentCategories
                }
            },
            include: {
                knowledgeProfiles: {
                    where: {
                        userId: userId
                    },
                    select: {
                        conceptMastery: true
                    }
                }
            }
        });

        // Sort categories by mastery level (lowest first)
        const sortedCategories = categories
            .map(category => ({
                conceptCategory: category.conceptCategory,
                mastery: category.knowledgeProfiles[0]?.conceptMastery || 0
            }))
            .sort((a, b) => a.mastery - b.mastery)
            .map(cat => cat.conceptCategory);

        return NextResponse.json(sortedCategories);
    } catch (error) {
        console.error('Error fetching concept categories:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
} 