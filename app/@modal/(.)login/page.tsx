"use client";
import { useRouter } from 'next/navigation';
import LoginPage from "@/app/components/SigninForm";
import Link from 'next/link';

export default function SigninModal() {
  const router = useRouter();
  return (    

     
    

    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
  <div className="bg-white w-full max-w-md rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
     <button
          onClick={() => router.back()}
          className="absolute right-4 top-4 text-xl"
        >
          ✕
        </button>
    
    <LoginPage />
  </div>
</div>
  );
}