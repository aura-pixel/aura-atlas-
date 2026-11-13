import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export const backendUrl=()=>process.env.API_INTERNAL_URL||process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000';
export async function requireSession(admin=false){
 const cookie=(await cookies()).get('atlas_session');
 if(!cookie)redirect('/login');
 let user;
 try{const res=await fetch(`${backendUrl()}/auth/me`,{headers:{Cookie:`atlas_session=${encodeURIComponent(cookie.value)}`},cache:'no-store',signal:AbortSignal.timeout(5000)});if(res.ok)user=await res.json();}catch{}
 if(!user)redirect('/login');
 if(admin&&user.role!=='SUPER_ADMIN')redirect('/teacher/dashboard');
 return user;
}
