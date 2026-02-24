// import React, { useRef, useState } from "react";

// const CameraCapture = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [stream, setStream] = useState(null);

//   const openCamera = async () => {
//     try {
//       const permission = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: false,
//       });

//       setStream(permission);

//       if (videoRef.current) {
//         videoRef.current.srcObject = permission;
//         videoRef.current.play();
//       }
//     } catch (err) {
//       console.error("Camera Error:", err);
//       alert("Camera access denied or not available.");
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop()); // Stop webcam
//       setStream(null);
//     }

//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//   };

//   const capturePhoto = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     if (!video || !canvas) return;

//     const ctx = canvas.getContext("2d");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//   };

//   return (
//     <div style={{ padding: "20px" }}>

//       <button
//         onClick={openCamera}
//         style={{
//           padding: "10px 20px",
//           background: "black",
//           color: "white",
//           border: "none",
//           borderRadius: "6px",
//           cursor: "pointer",
//           marginRight: "10px",
//         }}
//       >
//         Open Camera
//       </button>

//       {stream && (
//         <button
//           onClick={stopCamera}
//           style={{
//             padding: "10px 20px",
//             background: "red",
//             color: "white",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//           }}
//         >
//           Stop Camera
//         </button>
//       )}

//       <br /><br />

//       <video
//         ref={videoRef}
//         style={{
//           width: "300px",
//           height: "250px",
//           border: "2px solid black",
//           display: stream ? "block" : "none",
//         }}
//       ></video>

//       {stream && (
//         <button
//           onClick={capturePhoto}
//           style={{
//             padding: "8px 16px",
//             marginTop: "10px",
//             background: "green",
//             color: "white",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//             display: "block",
//           }}
//         >
//           Capture Photo
//         </button>
//       )}

//       <canvas
//         ref={canvasRef}
//         style={{ marginTop: "20px", border: "1px solid black" }}
//       ></canvas>
//     </div>
//   );
// };

// export default CameraCapture;



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

//   // Camera-related state/refs
//   // const [showCamera, setShowCamera] = useState(false);
//   // const [cameraStarting, setCameraStarting] = useState(false);
//   // const [cameraReady, setCameraReady] = useState(false);
//   // const videoRef = useRef(null);
//   // const canvasRef = useRef(null);
//   // const streamRef = useRef(null);

//   const fileInputRef = useRef(null);

//   // clean up any created object URL when component unmounts
//   useEffect(() => {
//     return () => {
//       if (formData.profilePic && formData.profileFile) {
//         try {
//           URL.revokeObjectURL(formData.profilePic);
//         } catch (e) {}
//       }
//       //stopCamera();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Hydrate user and form from token. Use cache-busting query param based on updatedAt or timestamp.
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

//         setFormData({
//           name: userData.name || "",
//           email: userData.email || "",
//           mobile: userData.mobile || "",
//           password: "********",
//           confirmPassword: "********",
//           profilePic: profilePicUrl,
//           profileFile: null,
//         });
//       } catch (err) {
//         console.error("Invalid token", err);
//       }
//     }
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Improved file change handler (works for camera captures and gallery picks)
//   const handleFileChange = (e) => {
//     const file = e.target.files && e.target.files[0];
//     if (!file) return;

//     // Revoke previous object URL if we created one
//     if (formData.profilePic && formData.profileFile) {
//       try {
//         URL.revokeObjectURL(formData.profilePic);
//       } catch (e) {}
//     }

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
//       // only append password if user changed it
//       if (formData.password !== "********")
//         data.append("password", formData.password);
//       if (formData.profileFile) data.append("profilePic", formData.profileFile);

//       const res = await fetch("http://localhost:8000/otp/update-profile", {
//         method: "PUT",
//         body: data,
//       });

//       const result = await res.json();

//       if (result.success) {
//         // Persist new token so refresh reads the updated user (no Authorization header used)
//         if (result.token) {
//           localStorage.setItem("authToken", result.token);
//         }

//         // Determine cache-busting value (use updatedAt if present on result.user)
//         const cacheBuster =
//           result.user && result.user.updatedAt
//             ? new Date(result.user.updatedAt).getTime()
//             : Date.now();

//         const fullPic = result.user.profilePic
//           ? `http://localhost:8000${result.user.profilePic}?t=${cacheBuster}`
//           : "";

//         // Update local user state and formData for immediate UI effect
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
//     }
//     setLoading(false);
//   };
//     const videoRef = useRef(null);
//     const canvasRef = useRef(null);
//     const [stream, setStream] = useState(null);
//   const openCamera = async () => {
//     try {
//       const permission = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: false,
//       });

//       setStream(permission);

//       if (videoRef.current) {
//         videoRef.current.srcObject = permission;
//         videoRef.current.play();
//       }
//     } catch (err) {
//       console.error("Camera Error:", err);
//       alert("Camera access denied or not available.");
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop()); // Stop webcam
//       setStream(null);
//     }

//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//   };

//   const capturePhoto = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     if (!video || !canvas) return;

//     const ctx = canvas.getContext("2d");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//   };
  
//   // helper: attach listeners to know when video is delivering frames
//   // const attachVideoReadyListeners = (videoEl) => {
//   //   if (!videoEl) return;

//   //   const onReady = () => {
//   //     // Check for dimensions to ensure video is streaming
//   //     if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
//   //       console.log(
//   //         `Camera ready. Dimensions: ${videoEl.videoWidth}x${videoEl.videoHeight}`
//   //       );
//   //       setCameraReady(true);
//   //       cleanup();
//   //     }
//   //   };

//   //   const cleanup = () => {
//   //     videoEl.removeEventListener("loadedmetadata", onReady);
//   //     videoEl.removeEventListener("playing", onReady);
//   //     videoEl.removeEventListener("canplay", onReady); // cleanup new listener
//   //   };

//   //   videoEl.addEventListener("loadedmetadata", onReady);
//   //   videoEl.addEventListener("playing", onReady);
//   //   videoEl.addEventListener("canplay", onReady); // Added for more robustness

//   //   // fallback timeout
//   //   const t = setTimeout(() => {
//   //     if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
//   //       setCameraReady(true);
//   //     } else {
//   //       console.warn("video still has zero size after timeout");
//   //     }
//   //     cleanup();
//   //     clearTimeout(t);
//   //   }, 3000);
//   // };

//   // --- Revised camera handlers with better autoplay handling and fallbacks ---
//   // const openCameraHandler = async () => {
//   //   // --- KEY SECURITY CHECK ---
//   //   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//   //     console.warn("getUserMedia is not supported by this browser.");
//   //     alert("Camera not available on this browser. Opening file selector.");
//   //     if (fileInputRef.current) fileInputRef.current.click();
//   //     return;
//   //   }
//   //   // Camera API requires a secure context (https:// or localhost)
//   //   if (window.isSecureContext === false) {
//   //     console.error(
//   //       "Camera access requires a secure context (https:// or localhost)."
//   //     );
//   //     alert(
//   //       "Camera access is only available on https:// or localhost. Opening file selector as fallback."
//   //     );
//   //     if (fileInputRef.current) fileInputRef.current.click();
//   //     return;
//   //   }
//   //   // --- END SECURITY CHECK ---

//   //   // Prefer facingMode but fallback gracefully
//   //   const preferredConstraints = { video: { facingMode: "user" } };

//   //   setCameraStarting(true);
//   //   setCameraReady(false);

//   //   try {
//   //     const stream = await navigator.mediaDevices.getUserMedia(
//   //       preferredConstraints
//   //     );
//   //     streamRef.current = stream;
//   //     if (videoRef.current) {
//   //       // set attributes before assigning srcObject to help autoplay policies
//   //       videoRef.current.muted = true; // required for autoplay
//   //       videoRef.current.playsInline = true; // required for iOS

//   //       videoRef.current.srcObject = stream;
//   //       setShowCamera(true);

//   //       // attempt to play and attach listeners
//   //       try {
//   //         await videoRef.current.play();
//   //       } catch (playErr) {
//   //         console.warn("video.play() failed:", playErr);
//   //       }

//   //       attachVideoReadyListeners(videoRef.current);
//   //     } else {
//   //       setShowCamera(true);
//   //     }

//   //     setCameraStarting(false);
//   //     return;
//   //   } catch (err) {
//   //     console.warn("getUserMedia with facingMode failed, trying fallback:", err);
//   //   }

//   //   // fallback to simplest constraint
//   //   try {
//   //     const fallbackStream = await navigator.mediaDevices.getUserMedia({
//   //       video: true,
//   //     });
//   //     streamRef.current = fallbackStream;
//   //     if (videoRef.current) {
//   //       videoRef.current.muted = true;
//   //       videoRef.current.playsInline = true;
//   //       videoRef.current.srcObject = fallbackStream;
//   //       setShowCamera(true);
//   //       try {
//   //         await videoRef.current.play();
//   //       } catch (playErr) {
//   //         console.warn("video.play() failed on fallback:", playErr);
//   //       }
//   //       attachVideoReadyListeners(videoRef.current);
//   //     } else {
//   //       setShowCamera(true);
//   //     }
//   //     setCameraStarting(false);
//   //     return;
//   //   } catch (err2) {
//   //     console.error("getUserMedia fallback failed:", err2);
//   //     setCameraStarting(false);
//   //   }

//   //   // final fallback: open file input (mobile will show camera/gallery picker)
//   //   if (fileInputRef.current) fileInputRef.current.click();
//   //   setCameraStarting(false);
//   // };

//   // const capturePhoto = () => {
//   //   const video = videoRef.current;
//   //   const canvas = canvasRef.current;
//   //   if (!video || !canvas) return;

//   //   const vw = video.videoWidth || 0;
//   //   const vh = video.videoHeight || 0;
//   //   if (vw === 0 || vh === 0) {
//   //     console.warn(
//   //       "Video has no dimensions yet (videoWidth/videoHeight = 0). Camera not ready."
//   //     );
//   //     alert("Camera not ready — try again in a moment.");
//   //     return;
//   //   }

//   //   canvas.width = vw;
//   //   canvas.height = vh;
//   //   const ctx = canvas.getContext("2d");

//   //   // --- KEY CHANGE ---
//   //   // Flip the canvas context horizontally to match the mirrored video preview
//   //   ctx.scale(-1, 1);
//   //   ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
//   //   // --- END KEY CHANGE ---

//   //   canvas.toBlob((blob) => {
//   //     if (!blob) return;
//   //     const file = new File([blob], `webcam_${Date.now()}.jpg`, {
//   //       type: "image/jpeg",
//   //     });
//   //     const previewUrl = URL.createObjectURL(file);

//   //     // stop camera
//   //     stopCamera();
//   //     setShowCamera(false);

//   //     setFormData((prev) => ({
//   //       ...prev,
//   //       profileFile: file,
//   //       profilePic: previewUrl,
//   //     }));
//   //   }, "image/jpeg", 0.92);
//   // };

//   // const stopCamera = () => {
//   //   if (streamRef.current) {
//   //     streamRef.current.getTracks().forEach((t) => {
//   //       try {
//   //         t.stop();
//   //       } catch (e) {}
//   //     });
//   //     streamRef.current = null;
//   //   }
//   //   if (videoRef.current) {
//   //     try {
//   //       videoRef.current.pause();
//   //       videoRef.current.srcObject = null;
//   //       videoRef.current.muted = false;
//   //     } catch (e) {
//   //       console.warn("stopCamera cleanup error", e);
//   //     }
//   //   }
//   //   setCameraReady(false);
//   // };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-10">
//       <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md sm:max-w-lg p-8 border border-gray-100 transition-all">
//         <div className="flex items-center justify-between mb-8">
//           <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
//           {!isEditing ? (
//             <button
//               onClick={() => setIsEditing(true)}
//               className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow hover:bg-slate-800/85 transition"
//             >
//               <Edit size={18} /> Edit
//             </button>
//           ) : (
//             <div className="flex gap-3">
//               <button
//                 onClick={handleSave}
//                 disabled={loading}
//                 className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow hover:bg-slate-800/85 transition"
//               >
//                 <Save size={18} /> {loading ? "Saving..." : "Save"}
//               </button>

//               {/* Camera button: tries getUserMedia (webcam). Falls back to file input if unavailable */}
//               {/* <button
//                 // onClick={openCameraHandler}
//                 className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-600/90 transition"
//                 aria-label="Open camera"
//                 title="Take photo"
//               >
//                 📷 Camera
//               </button> */}
//               <button
//                 onClick={openCamera}
//                 style={{
//                   padding: "10px 20px",
//                   background: "black",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "6px",
//                   cursor: "pointer",
//                   marginRight: "10px",
//                 }}
//               >
//                 Open Camera
//               </button>

//               <button
//                 onClick={() => {
//                   // if user cancels and we had an object URL preview, revoke it and restore token-based pic
//                   if (formData.profileFile && formData.profilePic) {
//                     try {
//                       URL.revokeObjectURL(formData.profilePic);
//                     } catch (e) {}
//                   }
//                   // reload from token to restore original values
//                   const token = localStorage.getItem("authToken");
//                   if (token) {
//                     try {
//                       const decoded = jwtDecode(token);
//                       const userData = decoded.user || decoded;
//                       const cacheBuster =
//                         userData.updatedAt &&
//                         typeof userData.updatedAt === "string"
//                           ? new Date(userData.updatedAt).getTime()
//                           : Date.now();
//                       const profilePicUrl = userData.profilePic
//                         ? `http://localhost:8000${userData.profilePic}?t=${cacheBuster}`
//                         : "";
//                       setFormData({
//                         name: userData.name || "",
//                         email: userData.email || "",
//                         mobile: userData.mobile || "",
//                         password: "********",
//                         confirmPassword: "********",
//                         profilePic: profilePicUrl,
//                         profileFile: null,
//                       });
//                     } catch (err) {
//                       console.error("Invalid token", err);
//                     }
//                   }
//                   setIsEditing(false);
//                 }}
//                 className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-500 transition"
//               >
//                 <X size={18} /> Cancel
//               </button>
//             </div>
//           )}
//         </div>

//         {user ? (
//           <>
//             <div className="flex flex-col items-center mb-6">
//               <img
//                 src={
//                   formData.profilePic
//                     ? formData.profilePic
//                     : `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                         (formData.name || "User").split(" ")[0]
//                       )}&background=0D8ABC&color=fff&size=120`
//                 }
//                 alt="profile"
//                 className="w-28 h-28 rounded-full border-4 border-slate-800 shadow-md mb-4 object-cover cursor-pointer"
//                 onClick={() =>
//                   isEditing &&
//                   fileInputRef.current &&
//                   fileInputRef.current.click()
//                 }
//               />

//               {/* Hidden file input: accept camera/gallery on mobile if getUserMedia not available */}
//               <input
//                 type="file"
//                 accept="image/*"
//                 capture="user"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 style={{ display: "none" }}
//               />

//               <h3 className="text-2xl font-semibold text-gray-800">
//                 {formData.name}
//               </h3>
//               <p className="text-gray-500">{formData.email}</p>
//             </div>

//             <div className="space-y-5">
//               <div>
//                 <label className="block text-gray-600 capitalize mb-1 font-medium">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
//                     isEditing
//                       ? "border-slate-800 focus:ring-slate-800 bg-white"
//                       : "border-gray-300 bg-gray-100"
//                   } transition`}
//                 />
//               </div>

//               <div>
//                 <label className="block text-gray-600 capitalize mb-1 font-medium">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   disabled
//                   className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 transition"
//                 />
//               </div>

//               <div>
//                 <label className="block text-gray-600 capitalize mb-1 font-medium">
//                   Mobile
//                 </label>
//                 <input
//                   type="text"
//                   name="mobile"
//                   value={formData.mobile}
//                   disabled
//                   className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 transition"
//                 />
//               </div>

//               <div>
//                 <label className="block text-gray-600 capitalize mb-1 font-medium">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
//                     isEditing
//                       ? "border-slate-800 focus:ring-slate-800 bg-white"
//                       : "border-gray-300 bg-gray-100"
//                   } transition`}
//                 />
//               </div>

//               <div>
//                 <label className="block text-gray-600 capitalize mb-1 font-medium">
//                   Confirm Password
//                 </label>
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
//                     isEditing
//                       ? "border-slate-800 focus:ring-slate-800 bg-white"
//                       : "border-gray-300 bg-gray-100"
//                   } transition`}
//                 />
//               </div>
//             </div>
//           </>
//         ) : (
//           <p className="text-red-500 mt-4 text-center">
//             ❌ No user info found. Please login again.
//           </p>
//         )}
//       </div>
//         <video
//         ref={videoRef}
//         style={{
//           width: "300px",
//           height: "250px",
//           border: "2px solid black",
//           display: stream ? "block" : "none",
//         }}
//       ></video>
//       {stream && (
//         <button
//           onClick={capturePhoto}
//           style={{
//             padding: "8px 16px",
//             marginTop: "10px",
//             background: "green",
//             color: "white",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//             display: "block",
//           }}
//         >
//           Capture Photo
//         </button>
//       )}
//       <canvas
//         ref={canvasRef}
//         style={{ marginTop: "20px", border: "1px solid black" }}
//       ></canvas>
//       {/* --- RESPONSIVE CAMERA MODAL ---
//       {showCamera && (
//         <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
//           <div className="bg-black rounded-lg p-4 shadow-xl w-full max-w-2xl">
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text-white font-semibold">Camera</h3>
//               {cameraStarting ? (
//                 <span className="text-sm text-gray-300">
//                   Starting camera...
//                 </span>
//               ) : null}
//               {!cameraReady && !cameraStarting ? (
//                 <span className="text-sm text-yellow-300">
//                   Waiting for video...
//                 </span>
//               ) : null}
//             </div>

//             <video
//               ref={videoRef}
//               className="w-full aspect-video bg-black rounded-md"
//               autoPlay
//               playsInline
//               muted
//               style={{ objectFit: "cover", transform: "scaleX(-1)" }} // Flip for "mirror" effect
//             />

//             <canvas ref={canvasRef} style={{ display: "none" }} />

//             <div className="flex gap-4 mt-4 justify-center">
//               <button
//                 onClick={capturePhoto}
//                 className={`text-white px-4 py-2 rounded-lg ${
//                   !cameraReady
//                     ? "bg-gray-500 cursor-not-allowed"
//                     : "bg-green-600 hover:bg-green-700"
//                 }`}
//                 disabled={!cameraReady}
//               >
//                 Capture Photo
//               </button>

//               <button
//                 onClick={() => {
//                   stopCamera();
//                   setShowCamera(false);
//                 }}
//                 className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )} */}
//     </div>
//   );
// }
