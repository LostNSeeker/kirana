// services/auth.ts
import { supabase } from './supabase';
import { AuthError, User } from '@supabase/supabase-js';
import { getUserProfile, createUserProfile } from './api';
import { UserProfile } from '../types/user';

export const signUp = async (
  email: string,
  password: string,
  userData: Partial<UserProfile>
): Promise<{ user: User | null; error: AuthError | null; profile: UserProfile | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { user: null, error, profile: null };
    }

    // Create user profile in database
    if (data.user) {
      const profile = await createUserProfile({
        ...userData,
        id: data.user.id,
        email: data.user.email,
      });
      return { user: data.user, error: null, profile };
    }

    return { user: data.user, error: null, profile: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: error as AuthError, profile: null };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null; profile: UserProfile | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error, profile: null };
    }

    // Fetch user profile
    if (data.user) {
      const profile = await getUserProfile(data.user.id);
      return { user: data.user, error: null, profile };
    }

    return { user: data.user, error: null, profile: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: error as AuthError, profile: null };
  }
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as AuthError };
  }
};

export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'myapp://reset-password',
    });
    return { error };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: error as AuthError };
  }
};

export const updatePassword = async (password: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: error as AuthError };
  }
};
