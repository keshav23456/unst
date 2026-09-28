import { API } from "./apiConfig.js";

const request = async (path, method, body) => {
    const response = await fetch(API(path), {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || `HTTP error! Status: ${response.status}`);
    return result;
};

export class AdminService {
    getAllUsers() {
        return request("/api/v1/user/admin/users", "GET");
    }
    updateUserRole(id, role) {
        // PUT, not PATCH: the backend's CORS config only allows GET/POST/PUT/DELETE.
        return request(`/api/v1/user/admin/users/${id}/role`, "PUT", { role });
    }
    deleteHackathon(id) {
        return request(`/api/v1/hackathon/organizer/${id}/delete`, "DELETE");
    }
}

const adminService = new AdminService();
export default adminService;
