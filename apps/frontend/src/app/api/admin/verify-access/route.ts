import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // auth() must be awaited
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Check if user has admin role
    const userRole = user.unsafeMetadata?.role;
    const isAdmin = userRole === "admin";

    // Optional: Hardcoded admin emails as fallback
    const adminEmails = ["website@sbrostech.com", "rforruban@gmail.com"];

    const emailIsAdmin = adminEmails.includes(
      user.emailAddresses[0]?.emailAddress || ""
    );

    return NextResponse.json({
      isAdmin: isAdmin || emailIsAdmin,
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      role: userRole,
    });
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      {
        isAdmin: false,
        error: "Verification failed",
      },
      { status: 500 }
    );
  }
}
