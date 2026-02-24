// import React, { useEffect, useState, useRef } from "react";
// import { jwtDecode } from "jwt-decode";
// import { Edit, Save, X } from "lucide-react";

// export default function Profile() {
//   const [user, setUser] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     password: "********",
//     confirmPassword: "********",
//     profilePic: "",
//     profileFile: null,
//   });
//   const [loading, setLoading] = useState(false);

//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     return () => {
//       try {
//         if (formData.profilePic && formData.profileFile)
//           URL.revokeObjectURL(formData.profilePic);
//       } catch (e) {}
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // hydrate from token
//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         const userData = decoded.user || decoded;
//         setUser(userData);

//         const cacheBuster =
//           userData.updatedAt && typeof userData.updatedAt === "string"
//             ? new Date(userData.updatedAt).getTime()
//             : Date.now();

//         const profilePicUrl = userData.profilePic
//           ? `http://localhost:8000${userData.profilePic}?t=${cacheBuster}`
//           : "";

//         setFormData((prev) => ({
//           ...prev,
//           name: userData.name || "",
//           email: userData.email || "",
//           mobile: userData.mobile || "",
//           profilePic: profilePicUrl,
//           profileFile: null,
//         }));
//       } catch (err) {
//         console.error("Invalid token", err);
//       }
//     }
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files && e.target.files[0];
//     if (!file) return;

//     try {
//       if (formData.profilePic && formData.profileFile)
//         URL.revokeObjectURL(formData.profilePic);
//     } catch (e) {}

//     const previewUrl = URL.createObjectURL(file);
//     setFormData((prev) => ({
//       ...prev,
//       profileFile: file,
//       profilePic: previewUrl,
//     }));
//   };

//   const handleSave = async () => {
//     if (formData.password !== formData.confirmPassword) {
//       alert("❌ Passwords do not match!");
//       return;
//     }

//     setLoading(true);
//     try {
//       const data = new FormData();
//       data.append("email", formData.email);
//       data.append("name", formData.name);
//       if (formData.password !== "********")
//         data.append("password", formData.password);
//       if (formData.profileFile) data.append("profilePic", formData.profileFile);

//       const res = await fetch("http://localhost:8000/otp/update-profile", {
//         method: "PUT",
//         body: data,
//       });

//       const result = await res.json();

//       if (result.success) {
//         if (result.token) localStorage.setItem("authToken", result.token);

//         const cacheBuster =
//           result.user && result.user.updatedAt
//             ? new Date(result.user.updatedAt).getTime()
//             : Date.now();

//         const fullPic = result.user.profilePic
//           ? `http://localhost:8000${result.user.profilePic}?t=${cacheBuster}`
//           : "";

//         setUser(result.user);
//         setFormData((prev) => ({
//           ...prev,
//           name: result.user.name || prev.name,
//           email: result.user.email || prev.email,
//           mobile: result.user.mobile || prev.mobile,
//           profilePic: fullPic,
//           profileFile: null,
//           password: "********",
//           confirmPassword: "********",
//         }));

//         alert("✅ Profile updated successfully!");
//         setIsEditing(false);
//       } else {
//         alert("❌ " + result.message);
//       }
//     } catch (err) {
//       console.error("Update profile error:", err);
//       alert("❌ Error updating profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------- Camera logic (unchanged) ----------------
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [stream, setStream] = useState(null);

//   const openCamera = async () => {
//     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//       if (fileInputRef.current) fileInputRef.current.click();
//       return;
//     }

//     if (
//       !window.isSecureContext &&
//       !window.location.hostname.includes("localhost")
//     ) {
//       alert(
//         "Camera requires HTTPS (or localhost). Falling back to file picker."
//       );
//       if (fileInputRef.current) fileInputRef.current.click();
//       return;
//     }

//     try {
//       const s = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: false,
//       });
//       setStream(s);
//       if (videoRef.current) {
//         videoRef.current.muted = true;
//         videoRef.current.playsInline = true;
//         videoRef.current.srcObject = s;
//         try {
//           await videoRef.current.play();
//         } catch (err) {
//           console.warn("video play failed:", err);
//         }
//       }
//     } catch (err) {
//       console.error("Camera Error:", err);
//       alert("Camera access denied or not available.");
//       if (fileInputRef.current) fileInputRef.current.click();
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach((t) => {
//         try {
//           t.stop();
//         } catch (e) {}
//       });
//       setStream(null);
//     }
//     if (videoRef.current) {
//       try {
//         videoRef.current.pause();
//         videoRef.current.srcObject = null;
//         videoRef.current.muted = false;
//       } catch (e) {}
//     }
//   };

//   const capturePhoto = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas) return;

//     const vw = video.videoWidth || 0;
//     const vh = video.videoHeight || 0;
//     if (vw === 0 || vh === 0) {
//       console.warn(
//         "Video has no dimensions yet (videoWidth/videoHeight = 0). Camera not ready."
//       );
//       alert("Camera not ready — try again in a moment.");
//       return;
//     }

//     canvas.width = vw;
//     canvas.height = vh;
//     const ctx = canvas.getContext("2d");

//     // mirror horizontally so selfie looks natural
//     ctx.save();
//     ctx.scale(-1, 1);
//     ctx.drawImage(video, -vw, 0, vw, vh);
//     ctx.restore();

//     canvas.toBlob(
//       (blob) => {
//         if (!blob) return;
//         const file = new File([blob], `webcam_${Date.now()}.jpg`, {
//           type: "image/jpeg",
//         });
//         const previewUrl = URL.createObjectURL(file);
//         try {
//           if (formData.profilePic && formData.profileFile)
//             URL.revokeObjectURL(formData.profilePic);
//         } catch (e) {}
//         // set preview locally (user still needs to click Save to call backend, unless you want auto-upload)
//         setFormData((prev) => ({
//           ...prev,
//           profileFile: file,
//           profilePic: previewUrl,
//         }));
//         stopCamera();
//       },
//       "image/jpeg",
//       0.92
//     );
//   };

//   // ---------------- New visual theme only (no logic changed) ----------------
//   return (
//     <div className="min-h-screen flex items-center justify-center p-6">
//       <div className="w-full max-w-4xl">
//         {/* Outer panel */}
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* LEFT: compact dark profile panel */}
//           <aside className="md:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-lg flex flex-col items-center gap-4">
//             <div className="relative">
//               <img
//                 src={
//                   formData.profilePic
//                     ? formData.profilePic
//                     : `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                         (formData.name || "User").split(" ")[0]
//                       )}&background=0A0F2B&color=fff&size=160`
//                 }
//                 alt="avatar"
//                 className="w-36 h-36 rounded-full object-cover border-4 border-slate-700 shadow-xl cursor-pointer"
//                 onClick={() =>
//                   isEditing &&
//                   fileInputRef.current &&
//                   fileInputRef.current.click()
//                 }
//               />
//             </div>

//             <input
//               type="file"
//               accept="image/*"
//               capture="user"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               style={{ display: "none" }}
//             />

//             <div className="text-center">
//               <h3 className="text-xl font-semibold">{formData.name}</h3>
//               <p className="text-sm text-slate-300">{formData.email}</p>
//             </div>

//             <div className="w-full pt-2">
//               <div className="flex flex-col gap-3">
//                 {!isEditing ? (
//                   <button
//                     onClick={() => setIsEditing(true)}
//                     className="w-full bg-amber-400 text-slate-900 rounded-lg py-2 font-semibold hover:scale-102 transition"
//                   >
//                     <span className="inline-flex items-center justify-center gap-2">
//                       <Edit size={16} /> Edit Profile
//                     </span>
//                   </button>
//                 ) : (
//                   <>
//                     <button
//                       onClick={handleSave}
//                       disabled={loading}
//                       className="w-full bg-emerald-500 text-white rounded-lg py-2 font-semibold hover:opacity-95 transition"
//                     >
//                       <span className="inline-flex items-center justify-center gap-2">
//                         <Save size={16} />{" "}
//                         {loading ? "Saving..." : "Save Changes"}
//                       </span>
//                     </button>

//                     {/* Left panel 'Open Camera' should be disabled while stream is active */}
//                     <button
//                       onClick={openCamera}
//                       disabled={!!stream}
//                       className={`w-full ${
//                         stream
//                           ? "bg-gray-500 text-gray-200 cursor-not-allowed"
//                           : "bg-indigo-600 text-white"
//                       } rounded-lg py-2 font-medium hover:opacity-95 transition`}
//                     >
//                       📷 Open Camera
//                     </button>

//                     <button
//                       onClick={() => {
//                         setIsEditing(false);
//                       }}
//                       className="w-full bg-slate-700 text-slate-200 rounded-lg py-2 hover:opacity-90 transition"
//                     >
//                       <span className="inline-flex items-center justify-center gap-2">
//                         <X size={14} /> Cancel
//                       </span>
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* small stats or helper */}
//             <div className="w-full mt-auto text-xs text-slate-300 text-center">
//               <p>
//                 Last updated: {user && user.updatedAt ? user.updatedAt : "—"}
//               </p>
//             </div>
//           </aside>

//           {/* RIGHT: large, clean form panel */}
//           <main className="md:col-span-8 bg-white rounded-2xl p-6 shadow-inner">
//             <div className="grid grid-cols-1 gap-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm text-slate-600">Full name</label>
//                   <input
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     disabled={!isEditing}
//                     className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
//                       isEditing
//                         ? "border-slate-300 bg-white"
//                         : "border-gray-200 bg-gray-50"
//                     } focus:outline-none`}
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm text-slate-600">Email</label>
//                   <input
//                     name="email"
//                     value={formData.email}
//                     disabled
//                     className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm text-slate-600">Mobile</label>
//                   <input
//                     name="mobile"
//                     value={formData.mobile}
//                     disabled
//                     className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm text-slate-600">Password</label>
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     disabled={!isEditing}
//                     className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
//                       isEditing
//                         ? "border-slate-300 bg-white"
//                         : "border-gray-200 bg-gray-50"
//                     } focus:outline-none`}
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="text-sm text-slate-600">
//                     Confirm password
//                   </label>
//                   <input
//                     type="password"
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     disabled={!isEditing}
//                     className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
//                       isEditing
//                         ? "border-slate-300 bg-white"
//                         : "border-gray-200 bg-gray-50"
//                     } focus:outline-none`}
//                   />
//                 </div>
//               </div>

//               {/* Camera area: card-like thin strip */}
//               <div className="mt-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
//                 <div className="flex-1">
//                   <p className="text-sm text-slate-600 mb-2">
//                     Camera / Capture
//                   </p>

//                   <div className="rounded-md overflow-hidden bg-black aspect-video w-full md:w-[500px] flex items-center justify-center">
//                     <video
//                       ref={videoRef}
//                       className="w-full h-full object-cover"
//                       style={{ display: stream ? "block" : "none" }}
//                       playsInline
//                       muted
//                       autoPlay
//                     />
//                     {!stream && (
//                       <div className="text-center text-slate-400 p-4">
//                         <div className="text-sm">No camera active</div>
//                         <div className="text-xs mt-1">
//                           Click "Open Camera" in the left panel
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Right-panel buttons: Open, Capture, Stop.
//                   Open disabled when stream is active; Capture/Stop enabled only when stream exists */}
//               <div className="w-full md:w-auto flex gap-3 mt-3">
//   <button
//     onClick={capturePhoto}
//     disabled={!stream}
//     className={
//       `flex-1 md:w-40 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-sm
//       ${stream 
//         ? "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg" 
//         : "bg-gray-200 text-gray-500 cursor-not-allowed"
//       }`
//     }
//   >
//     Capture
//   </button>

//   <button
//     onClick={stopCamera}
//     disabled={!stream}
//     className={
//       `flex-1 md:w-40 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-sm
//       ${stream
//         ? "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg"
//         : "bg-gray-200 text-gray-500 cursor-not-allowed"
//       }`
//     }
//   >
//     Stop
//   </button>
// </div>



//               <div className="text-sm text-gray-500">
//                 Tip: After you capture, a preview is set as your avatar locally
//                 — click Save to upload it to server.
//               </div>
//             </div>
//           </main>
//         </div>

//         {/* hidden canvas used for capture */}
//         <canvas ref={canvasRef} style={{ display: "none" }} />
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { Edit, Save, X } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "********",
    confirmPassword: "********",
    profilePic: "",
    profileFile: null,
  });
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      try {
        if (formData.profilePic && formData.profileFile)
          URL.revokeObjectURL(formData.profilePic);
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // hydrate from token
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userData = decoded.user || decoded;
        setUser(userData);

        const cacheBuster =
          userData.updatedAt && typeof userData.updatedAt === "string"
            ? new Date(userData.updatedAt).getTime()
            : Date.now();

        const profilePicUrl = userData.profilePic
          ? `http://localhost:8000${userData.profilePic}?t=${cacheBuster}`
          : "";

        setFormData((prev) => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          mobile: userData.mobile || "",
          profilePic: profilePicUrl,
          profileFile: null,
        }));
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      if (formData.profilePic && formData.profileFile)
        URL.revokeObjectURL(formData.profilePic);
    } catch (e) {}

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      profileFile: file,
      profilePic: previewUrl,
    }));
  };

  const handleSave = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("email", formData.email);
      data.append("name", formData.name);
      if (formData.password !== "********")
        data.append("password", formData.password);
      if (formData.profileFile) data.append("profilePic", formData.profileFile);

      const res = await fetch("http://localhost:8000/otp/update-profile", {
        method: "PUT",
        body: data,
      });

      const result = await res.json();

      if (result.success) {
        if (result.token) localStorage.setItem("authToken", result.token);

        const cacheBuster =
          result.user && result.user.updatedAt
            ? new Date(result.user.updatedAt).getTime()
            : Date.now();

        const fullPic = result.user.profilePic
          ? `http://localhost:8000${result.user.profilePic}?t=${cacheBuster}`
          : "";

        setUser(result.user);
        setFormData((prev) => ({
          ...prev,
          name: result.user.name || prev.name,
          email: result.user.email || prev.email,
          mobile: result.user.mobile || prev.mobile,
          profilePic: fullPic,
          profileFile: null,
          password: "********",
          confirmPassword: "********",
        }));

        alert("✅ Profile updated successfully!");
        setIsEditing(false);
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error("Update profile error:", err);
      alert("❌ Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Camera logic (unchanged) ----------------
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }

    if (
      !window.isSecureContext &&
      !window.location.hostname.includes("localhost")
    ) {
      alert(
        "Camera requires HTTPS (or localhost). Falling back to file picker."
      );
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.srcObject = s;
        try {
          await videoRef.current.play();
        } catch (err) {
          console.warn("video play failed:", err);
        }
      }
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Camera access denied or not available.");
      if (fileInputRef.current) fileInputRef.current.click();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch (e) {}
      });
      setStream(null);
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.muted = false;
      } catch (e) {}
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth || 0;
    const vh = video.videoHeight || 0;
    if (vw === 0 || vh === 0) {
      console.warn(
        "Video has no dimensions yet (videoWidth/videoHeight = 0). Camera not ready."
      );
      alert("Camera not ready — try again in a moment.");
      return;
    }

    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");

    // mirror horizontally so selfie looks natural
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -vw, 0, vw, vh);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `webcam_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const previewUrl = URL.createObjectURL(file);
        try {
          if (formData.profilePic && formData.profileFile)
            URL.revokeObjectURL(formData.profilePic);
        } catch (e) {}
        setFormData((prev) => ({
          ...prev,
          profileFile: file,
          profilePic: previewUrl,
        }));
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  // ---------------- New light UI (same vibe as Expense page) ----------------
  return (
    // <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-lg">
              {/* simple avatar icon style */}
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-semibold">
                P
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Profile
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            View and update your personal details and profile picture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT: profile summary card */}
          <aside className="md:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={
                  formData.profilePic
                    ? formData.profilePic
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        (formData.name || "User").split(" ")[0]
                      )}&background=059669&color=fff&size=160`
                }
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-emerald-100 shadow-md cursor-pointer"
                onClick={() =>
                  isEditing &&
                  fileInputRef.current &&
                  fileInputRef.current.click()
                }
              />
              {isEditing && (
                <span className="absolute -bottom-1 right-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[0.65rem] font-semibold text-white shadow">
                  Change
                </span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              capture="user"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {formData.name || "User"}
              </h3>
              <p className="text-sm text-gray-500">{formData.email}</p>
              {formData.mobile && (
                <p className="text-xs text-gray-500 mt-1">
                  📱 {formData.mobile}
                </p>
              )}
            </div>

            <div className="w-full pt-2 space-y-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:transform-none"
                  >
                    <Save size={16} />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={openCamera}
                    disabled={!!stream}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 ${
                      stream
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-lg transform hover:scale-[1.02]"
                    }`}
                  >
                    📷 Open Camera
                  </button>

                  <button
                    onClick={() => {
                      setIsEditing(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </>
              )}
            </div>

            <div className="w-full mt-4 text-xs text-gray-500 text-center border-t border-gray-100 pt-3">
              Last updated:{" "}
              {user && user.updatedAt ? user.updatedAt : "Not available"}
            </div>
          </aside>

          {/* RIGHT: form + camera */}
          <main className="md:col-span-2 space-y-4">
            {/* Details card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Account Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      isEditing
                        ? "border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Mobile
                  </label>
                  <input
                    name="mobile"
                    value={formData.mobile}
                    disabled
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      isEditing
                        ? "border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      isEditing
                        ? "border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Camera card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Camera / Capture
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                Use your camera to capture a new profile picture.
              </p>

              <div className="flex flex-col gap-4">
                <div className="rounded-xl overflow-hidden bg-black aspect-video w-full max-w-xl border border-gray-200">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={{ display: stream ? "block" : "none" }}
                    playsInline
                    muted
                    autoPlay
                  />
                  {!stream && (
                    <div className="flex items-center justify-center h-full text-center text-gray-400 text-sm">
                      <div>
                        <div>No camera active</div>
                        <div className="text-xs mt-1">
                          Click <span className="font-semibold">Open Camera</span> in the left card to start.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={capturePhoto}
                    disabled={!stream}
                    className={`flex-1 sm:flex-none sm:w-40 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold shadow-md text-sm transition-all duration-200 ${
                      stream
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg transform hover:scale-[1.02]"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    📸 Capture
                  </button>

                  <button
                    onClick={stopCamera}
                    disabled={!stream}
                    className={`flex-1 sm:flex-none sm:w-40 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold shadow-md text-sm transition-all duration-200 ${
                      stream
                        ? "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg transform hover:scale-[1.02]"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    ⏹ Stop
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  After capturing, the preview will appear on the left avatar.
                  Don&apos;t forget to click <strong>Save Changes</strong> to
                  upload it.
                </p>
              </div>
            </div>
          </main>
        </div>

        {/* hidden canvas used for capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    // </div>
  );
}
