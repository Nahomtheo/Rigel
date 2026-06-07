
import Chat from "@/app/components/Chat";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session=await getServerSession(authOptions)
  const userid = (session?.user as any)?.id     

  const  convoid = await params;
  console.log("User ID in Chat Page:", userid, convoid.id);
  
  return (
    <Chat
      conversationId={convoid.id}
      userId={userid}
    />
  );
}
