'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth/auth.service';
import { post } from '@/lib/api';
import type { LoginData,RegisterData } from '@/types/auth';
export function useLogin(){return useMutation({mutationFn:(data:LoginData)=>authService.login(data)});}
export function useRegister(){return useMutation({mutationFn:(data:RegisterData)=>authService.register(data)});}
export function useLogout(){const client=useQueryClient();return useMutation({mutationFn:async()=>{await post('/auth/logout',{});localStorage.removeItem('auth');client.clear();}});}
