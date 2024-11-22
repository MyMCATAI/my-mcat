import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export class UserService {
  static async getUserEmail(): Promise<string | null> {
    try {
      // Get current user from Clerk
      const user = await currentUser();
      if (!user) return null;
      
      // Get primary email address
      return user.emailAddresses[0]?.emailAddress || null;
    } catch (error) {
      console.error('Error fetching user email:', error);
      return null;
    }
  }

  static async getUserData(userId: string) {
    try {
      const userData = await prismadb.userInfo.findUnique({
        where: { userId: userId }
      });
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }
  static async getUserName() {
    try {
      const user = await currentUser();

      return user?.firstName
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }
} 