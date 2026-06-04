"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type AdminUser = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  role?: string;
  isVerified?: boolean;
  isBanned?: boolean;
  isPremium?: boolean;
  premiumExpiry?: string;
  showPhoneToNonPremium?: boolean;
  createdAt?: string;
  verification?: {
    idType?: string;
    status?: "approved" | "rejected" | "pending";
    document?: {
      url?: string;
    };
  };
};

export default function EditUser() {
  const params = useParams<{ userID: string }>();
  const userID = params.userID;
  const [verify, setVerify] = useState(false);
  const[toggle,setToggle]=useState(false)
  const [togglee,setTogglee]=useState(false)
  
  const [documentVerification, setDocumentVerification]=useState<"approved"|"rejected"|"pending">("pending")
  const [ban, setBan] = useState(false);
  const [deletecontent, setDeleteContent] = useState(false);
  const [data, setData] = useState<AdminUser | null>(null);
 

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  

  const fetchUseer= useCallback(async()=>{
    try {
      const res=await fetch(`/api/admin/allusers/${userID}`,{
        method:"GET",
      })
      const udata=await res.json()
       setData(udata)
       setVerify(Boolean(udata?.isVerified))
       setBan(Boolean(udata?.isBanned))
       setDocumentVerification(udata?.verification?.status || "pending")
      
    } catch (error) {
      console.log(error)
    }
    

  }, [userID])
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchUseer()
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchUseer])

  const updateUser = async () => {
    try {
      setLoading(true);
     
      const req = await fetch(`/api/admin/allusers/${userID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verify,
          ban,
          deletecontent,
          documentVerification:documentVerification
        }),
      });

      const ndata = await req.json();
      setData(ndata.user);

      setMessage(ndata.message || "User updated");
      setShowConfirm(false);
      await fetchUseer()
      

    } catch (error) {
      console.log(error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
 

 
  

 return (
  <div className="min-h-screen bg-slate-100 p-6">

    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">

      {/* LEFT SIDE */}

      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm lg:col-span-1">
        <Link href="/admin/manageUsers" className="text-sm font-medium text-slate-500 hover:text-slate-950">
          Back to users
        </Link>

        <div className="flex flex-col items-center">

          <img
            src={
              data?.profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-slate-200"
          />

          <h1 className="text-3xl font-bold mt-5">
            {data?.name}
          </h1>

          <p className="text-slate-500 mt-1">
            {data?.email}
          </p>

          <div className="flex gap-2 mt-4 flex-wrap justify-center">

            <span
              className={`px-3 py-1 rounded-full text-sm text-white ${
                data?.role === "admin"
                  ? "bg-red-500"
                  : "bg-slate-950"
              }`}
            >
              {data?.role}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-sm text-white ${
                data?.isVerified
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            >
              {data?.isVerified
                ? "Verified"
                : "Not Verified"}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-sm text-white ${
                data?.isPremium
                  ? "bg-purple-500"
                  : "bg-gray-500"
              }`}
            >
              {data?.isPremium
                ? "Premium"
                : "Free"}
            </span>

          </div>

        </div>

        {/* BASIC INFO */}

        <div className="mt-8 space-y-5">

          <div>
            <p className="text-sm text-slate-400">
              Phone
            </p>

            <p className="font-semibold">
              {data?.phone || "No phone"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Premium Expiry
            </p>

            <p className="font-semibold">
              {data?.premiumExpiry
                ? new Date(
                    data.premiumExpiry
                  ).toLocaleDateString()
                : "No Premium"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Show Phone To Non Premium
            </p>

            <p className="font-semibold">
              {data?.showPhoneToNonPremium
                ? "Enabled"
                : "Disabled"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Created At
            </p>

            <p className="font-semibold">
              {data?.createdAt ? new Date(
                data.createdAt
              ).toLocaleString() : "Unknown"}
            </p>
          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="lg:col-span-2 space-y-6">

        {/* VERIFICATION INFO */}

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold mb-6">
            Verification Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="rounded-lg bg-slate-50 p-5">

              <p className="text-sm text-slate-400">
                ID Type
              </p>

              <p className="font-semibold text-lg mt-1">
                {data?.verification?.idType ||
                  "No ID"}
              </p>

            </div>

            <div className="rounded-lg bg-slate-50 p-5">

              <p className="text-sm text-slate-400">
                Verification Status
              </p>


              <p className="font-semibold text-lg mt-1">
                {data?.verification?.status ||
                  "Pending"}
              </p>
              <input
              type="checkbox"
              checked={toggle}
              onChange={(e) =>{
                setDocumentVerification("approved")
                setToggle(e.target.checked)
                 setTogglee(false)}}
              className="w-5 h-5 mt-2"
            />
             <span className="ml-2 text-sm text-slate-600">
              Approve Document
            </span>
             <input
              type="checkbox"
              checked={togglee}
              onChange={(e) =>{
                setDocumentVerification("rejected") 
                setTogglee(e.target.checked)
                setToggle(false)}}
              className="w-5 h-5 mt-2"
            />
             <span className="ml-2 text-sm text-slate-600">
              Reject Document
            </span>


            </div>

          </div>

          <div className="mt-6">

            <p className="text-sm text-slate-400 mb-3">
              Verification Document
            </p>

            {data?.verification?.document?.url ? (
              <a
                href={data?.verification?.document?.url}
                target="_blank"
                className="inline-block rounded-lg bg-slate-950 px-5 py-3 text-white"
              >
                View Uploaded Document
              </a>
            ) : (
              <p>No document uploaded</p>
            )}

          </div>

        </div>

        {/* ACCOUNT CONTROLS */}

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold mb-6">
            Account Controls
          </h2>

          <div className="space-y-5">

            <label className="flex items-center justify-between rounded-lg bg-slate-50 p-4">

              <span className="font-medium">
                Verify User
              </span>

              <input
                type="checkbox"
                checked={verify}
                onChange={(e) =>
                  setVerify(e.target.checked)
                }
                className="w-5 h-5"
              />

            </label>

            <label className="flex items-center justify-between rounded-lg bg-slate-50 p-4">

              <span className="font-medium text-red-500">
                Ban User
              </span>

              <input
                type="checkbox"
                checked={ban}
                onChange={(e) =>
                  setBan(e.target.checked)
                }
                className="w-5 h-5"
              />

            </label>

            <label className="flex items-center justify-between rounded-lg bg-slate-50 p-4">

              <span className="font-medium text-orange-500">
                Delete User Content
              </span>

              <input
                type="checkbox"
                checked={deletecontent}
                onChange={(e) =>
                  setDeleteContent(e.target.checked)
                }
                className="w-5 h-5"
              />

            </label>

          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="w-full mt-8 rounded-lg bg-slate-950 py-3 text-white transition hover:bg-slate-800"
          >
            Save Changes
          </button>

          {message && (
            <p className="text-center mt-4 text-sm text-slate-600">
              {message}
            </p>
          )}

        </div>

      </div>

    </div>

    {/* Confirmation Modal */}

    {showConfirm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">

        <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl">

          <h2 className="text-2xl font-bold mb-3">
            Are you sure?
          </h2>

          <p className="text-slate-600 mb-6">
            This action will update the user&apos;s account settings.
          </p>

          <div className="flex gap-3">

            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 rounded-lg border border-slate-300 py-2"
            >
              Cancel
            </button>

            <button
              onClick={updateUser}
              disabled={loading}
              className="flex-1 rounded-lg bg-red-500 py-2 text-white"
            >
              {loading ? "Updating..." : "Confirm"}
            </button>

          </div>

        </div>

      </div>
    )}
  </div>
);
}
