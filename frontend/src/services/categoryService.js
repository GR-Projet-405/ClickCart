import { API_BASE_URL } from "../config/api";
import { authFetch } from "./authService";
async function request(path, method = "GET", body) {
 const response = await authFetch(`${API_BASE_URL}${path}`, {method, headers:{"Content-Type":"application/json"}, ...(body === undefined ? {} : {body:JSON.stringify(body)})});
 const data = await response.json().catch(()=>null);
 if(!response.ok) throw new Error(data?.message || `Category request failed (${response.status})`);
 return data;
}
export default {
 getAllCategories:()=>request("/categories"),
 getAllCategoriesAdmin:()=>request("/admin/categories"),
 createCategory:data=>request("/admin/categories","POST",data),
 updateCategory:(id,data)=>request(`/admin/categories/${encodeURIComponent(id)}`,"PUT",data),
 deleteCategory:id=>request(`/admin/categories/${encodeURIComponent(id)}`,"DELETE"),
 toggleCategoryStatus:(id,active)=>request(`/admin/categories/${encodeURIComponent(id)}/toggle-status`,"PATCH",{active}),
};
