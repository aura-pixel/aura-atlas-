import { API_URL } from './config';
async function request<T>(method:string,url:string,data?:unknown):Promise<T>{
 const form=typeof FormData!=='undefined'&&data instanceof FormData;
 const response=await fetch(`${API_URL}${url}`,{method,credentials:'same-origin',cache:'no-store',headers:form?{}:{'Content-Type':'application/json'},...(data===undefined?{}:{body:form?data:JSON.stringify(data)})});
 const text=await response.text();let result;
 try{result=text?JSON.parse(text):null;}catch{throw new Error('El servidor devolvió una respuesta inválida.');}
 if(!response.ok)throw new Error(Array.isArray(result?.message)?result.message.join('. '):result?.message||'No se pudo completar la petición.');
 return result as T;
}
export const get=<T=unknown>(url:string)=>request<T>('GET',url);
export const post=<T=unknown>(url:string,data:unknown)=>request<T>('POST',url,data);
export const postForm=post;
export const patch=<T=unknown>(url:string,data:unknown)=>request<T>('PATCH',url,data);
export const patchForm=patch;
export const put=<T=unknown>(url:string,data:unknown)=>request<T>('PUT',url,data);
export const del=<T=unknown>(url:string)=>request<T>('DELETE',url);
