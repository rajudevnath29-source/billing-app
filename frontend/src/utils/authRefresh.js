import axios from "axios";
import { redirectToLogin } from "./session";
import { API_URL } from "../config/api";

export const refreshUser = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await axios.get(
            `${API_URL}/auth/profile`,
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
