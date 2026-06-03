import axios from "axios";
import { redirectToLogin } from "./session";

export const refreshUser = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await axios.get(
            "http://localhost:5000/api/auth/profile",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        localStorage.setItem(
            "user",
            JSON.stringify(res.data),
        );
    } catch (error) {
        if (error?.response?.status === 401) {
            redirectToLogin();
            return;
        }

        console.log("User refresh failed");
    }
};
