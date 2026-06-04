"use client";

import { useSession } from "next-auth/react";
import {signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Verification({params}:{params:{id:string}}) {
  


  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [resend,setResend]=useState(false)
  const[timer,setTimer]=useState(30)
  const [canResend,setCanResend]=useState(false)

  const [loading, setLoading] =useState(false);
    

  const [message, setMessage] =useState("");

  // redirect if not logged in
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);
 

 
  

  const handleVerify = async (resendd:boolean) => {
    try {
      const userId=await params
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "/api/otp-verification",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            userid: userId.id,
            otp,
            shouldResend:resendd
          }),
        }
      );

      const data =await response.json();
        console.log("ui resend value:" ,resend)

      if (data.success) {
        setMessage(
          "✅ OTP verified successfully"
        );
        const login = await signIn("credentials", {
          redirect: false,
          email: data.data.email,
          password: data.data.password,
        });
        if (login?.ok) {

    router.push("/");

  }

       if (data.data?.newOtp.length>0){
        setMessage(
          "✅ OTP resent successfully"
        );
        
       }

        // redirect after success
        


      } 

    } 
    catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong"
      );

    } finally {
      setLoading(false);
      
    }
  };
  
   



  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-2">
          Verify OTP
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Enter the 6-digit code
          sent to your email
        </p>

        <input
          type="text"
          value={otp}
          maxLength={6}
          onChange={(e) =>
            setOtp(e.target.value)
          }
          placeholder="123456"
          className="w-full border rounded-xl px-4 py-3 text-center text-2xl tracking-[10px] outline-none focus:ring-2 focus:ring-black"
        />

        <button
          onClick={()=>{ handleVerify(false) }}
          disabled={
            loading || otp.length !== 6
          }
          className="w-full mt-6 bg-black text-white py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {loading
            ? "Verifying..."
            : "Verify OTP"}
        </button>
        <button
        onClick={()=>{ 
          handleVerify(true)}
        }
        disabled={loading}
        className="w-full mt-4 bg-gray-500 text-white py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
      >{canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
        
      </button>

        {message && (
          <p className="text-center mt-4 text-sm">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}