import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";

export async function PUT(req: Request) {
  await connectDB();
  
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { phone, showPhoneToNonPremium ,verificationID,typeofDocument} = await req.json();

  const updateData: { phone?: string; showPhoneToNonPremium?: boolean } = {};
  
  if (phone !== undefined) {
    updateData.phone = phone;
  }
  
  if (showPhoneToNonPremium !== undefined) {
    updateData.showPhoneToNonPremium = showPhoneToNonPremium;
  }
 if(verificationID !== undefined && typeofDocument !== undefined){
  const verificationData = {
    verification: {
      document: {
        url: verificationID.url,
        publicId: verificationID.publicId,
      },
      idType: typeofDocument,
      status: "pending",
    },
  };
  Object.assign(updateData, verificationData);
 }


  const updatedUser = await User.findOneAndUpdate(
    { email: session.user.email },
    updateData,
    { returnDocument: "after", runValidators: true }
  );

  if (!updatedUser) {
    return Response.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    user: {
      phone: updatedUser.phone,
      showPhoneToNonPremium: updatedUser.showPhoneToNonPremium,
     
    },
  });
}

export async function GET(req: Request) {
  await connectDB();
  
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return Response.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    user: {
      phone: user.phone,
      showPhoneToNonPremium: user.showPhoneToNonPremium,
    },
  });
}