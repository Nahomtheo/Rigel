import UserListing from "@/app/components/UserListing";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Userlistings(){
    const session=await getServerSession(authOptions)
    const ownerid= (session?.user as any)?.id
    if (!session){
        redirect("/login")
    }
    
    if(!ownerid){
        redirect("/login")
    }
    
    return(
        <div className="min-h-screen bg-slate-50">
            <UserListing ownerId={ownerid}/>
        </div>
    )
}