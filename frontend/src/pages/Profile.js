import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [image, setImage] = useState(null);

  const uploadImage = async () => {
    try {
      const formData = new FormData();

      formData.append("image", image);

      const token = localStorage.getItem("token");

      const res = await axios.put(
        "http://localhost:5000/api/auth/profile-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Profile image updated");

      window.location.reload();
    } catch (error) {
      console.log(error);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: 30, flex: 1 }}>
        <h1>My Profile</h1>

        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 10,
            width: 400,
          }}
        >
          <img
            src={
              user?.profile_image
                ? `http://localhost:5000/uploads/${user.profile_image}`
                : "https://i.pravatar.cc/150"
            }
            alt=""
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: 20,
            }}
          />

          <h3>{user?.name}</h3>

          <p>{user?.email}</p>

          <p>{user?.role}</p>

          <input type="file" onChange={(e) => setImage(e.target.files[0])} />

          <button
            onClick={uploadImage}
            style={{
              marginTop: 15,
              padding: 10,
              width: "100%",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
            }}
          >
            Upload Image
          </button>
        </div>
      </div>
    </div>
  );
}
