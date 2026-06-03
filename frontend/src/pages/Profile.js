import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import { API_URL, getUploadUrl } from "../config/api";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // ================= FILE SELECT =================
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= CROPPER =================
  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

  const getCroppedImg = async (imageSrc, cropPixels) => {
    const image = await createImage(imageSrc);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;

    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  };

  // ================= UPLOAD =================
  const uploadImage = async () => {
    if (!preview) {
      toast.error("Please select image");
      return;
    }

    try {
      setLoading(true);

      const croppedBlob = await getCroppedImg(preview, croppedAreaPixels);

      const formData = new FormData();
      formData.append("image", croppedBlob, "profile.jpg");

      const res = await axios.put(
        `${API_URL}/auth/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ================= RESET AFTER SUCCESS =================
      setImage(null);
      setPreview(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setFileInputKey(Date.now());

      toast.success("Profile image updated Successfully");
      navigate("/profile");
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>View account details and update photo</p>
        </div>
      </div>

      <div style={styles.profileGrid}>
        {/* LEFT CARD (UNCHANGED DESIGN) */}
        <section style={styles.card}>
          <div style={styles.darkHeader}>Profile Details</div>

          <div style={styles.identity}>
            <img
              src={
                user?.profile_image
                  ? getUploadUrl(user.profile_image)
                  : "https://i.pravatar.cc/150"
              }
              alt="User profile"
              style={styles.avatar}
            />

            <div>
              <h2 style={styles.name}>{user?.name || "-"}</h2>
              <p style={styles.email}>{user?.email || "-"}</p>
              <span style={styles.roleBadge}>{user?.role || "USER"}</span>
            </div>
          </div>

          <div style={styles.infoTable}>
            <div style={styles.infoRow}>
              <span>Name</span>
              <strong>{user?.name || "-"}</strong>
            </div>
            <div style={styles.infoRow}>
              <span>Email</span>
              <strong>{user?.email || "-"}</strong>
            </div>
            <div style={styles.infoRow}>
              <span>Role</span>
              <strong>{user?.role || "-"}</strong>
            </div>
          </div>
        </section>

        {/* RIGHT CARD (ONLY CROPPER UPGRADE) */}
        <section style={styles.card}>
          <div style={styles.darkHeader}>Edit Profile Photo</div>

          <label style={styles.uploadBox}>
            <span style={styles.uploadTitle}>Choose profile image</span>
            <span style={styles.uploadHint}>
              {image ? image.name : "PNG, JPG or JPEG"}
            </span>

            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              style={styles.fileInput}
            />
          </label>

          {/* ================= CROPPER ================= */}
          {preview && (
            <div style={styles.cropWrapper}>
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={1} // square fix
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={false}
              />
            </div>
          )}

          {/* ZOOM */}
          {preview && (
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              style={styles.zoom}
            />
          )}

          <button onClick={uploadImage} style={styles.primaryBtn}>
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </section>
      </div>
    </div>
  );
}

/* ================= ORIGINAL + FIXED STYLES ================= */
const styles = {
  page: { padding: 10 },

  topBar: { marginBottom: 16 },

  title: { margin: 0, fontSize: 28, color: "#0f172a" },

  subtitle: { margin: "4px 0 0", color: "#64748b" },

  profileGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(360px, 1.2fr) minmax(300px, 0.8fr)",
    gap: 16,
    alignItems: "start",
  },

  card: {
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    padding: 14,
  },

  darkHeader: {
    background: "#0f172a",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 8,
    fontWeight: 700,
    marginBottom: 14,
  },

  identity: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #e2e8f0",
  },

  name: { margin: 0, color: "#0f172a", fontSize: 22 },

  email: { margin: "4px 0 8px", color: "#64748b" },

  roleBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 700,
  },

  infoTable: { borderTop: "1px solid #eee" },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    color: "#475569",
  },

  uploadBox: {
    display: "grid",
    gap: 5,
    padding: 16,
    border: "1px dashed #94a3b8",
    borderRadius: 8,
    background: "#f8fafc",
    cursor: "pointer",
    marginBottom: 14,
  },

  uploadTitle: { fontWeight: 800 },

  uploadHint: { color: "#64748b", fontSize: 13 },

  fileInput: { marginTop: 8 },

  primaryBtn: {
    width: "100%",
    padding: "10px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
  },

  cropWrapper: {
    position: "relative",
    width: "100%",
    height: 300,
    background: "#eee",
    marginTop: 10,
  },

  zoom: {
    width: "100%",
    marginTop: 10,
  },
};
