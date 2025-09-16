import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Enhanced error handling for Supabase client creation
let supabase: any;

try {
  if (!SUPABASE_URL || SUPABASE_URL === 'https://placeholder.supabase.co' || 
      !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'placeholder-anon-key') {
    console.warn('⚠️ Supabase credentials not configured. Using mock client. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
    
    // Create a mock client that doesn't make actual requests
    supabase = {
      auth: {
        getSession: () => {
          console.log('🔄 Mock: getSession called');
          return Promise.resolve({ data: { session: null }, error: null });
        },
        signInWithOtp: () => {
          console.warn('🚫 Mock: signInWithOtp called - Supabase not configured');
          return Promise.resolve({ error: new Error('Supabase not configured') });
        },
        verifyOtp: () => {
          console.warn('🚫 Mock: verifyOtp called - Supabase not configured');
          return Promise.resolve({ error: new Error('Supabase not configured') });
        },
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: (callback: any) => {
          console.log('🔄 Mock: onAuthStateChange called');
          // Call the callback immediately with null session for mock
          setTimeout(() => callback('SIGNED_OUT', null), 0);
          return { data: { subscription: { unsubscribe: () => console.log('🔄 Mock: Auth subscription unsubscribed') } } };
        }
      },
      from: () => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            maybeSingle: () => {
              console.log(`🔄 Mock: ${table}.select(${columns}).eq(${column}, ${value}).maybeSingle()`);
              return Promise.resolve({ data: null, error: null });
            },
            single: () => {
              console.log(`🔄 Mock: ${table}.select(${columns}).eq(${column}, ${value}).single()`);
              return Promise.resolve({ data: null, error: null });
            },
            order: (column: string, options?: any) => ({
              range: (from: number, to: number) => {
                console.log(`🔄 Mock: ${table}.select(${columns}).eq().order(${column}).range(${from}, ${to})`);
                return Promise.resolve({ data: [], error: null, count: 0 });
              }
            })
          }),
          order: (column: string, options?: any) => ({
            range: (from: number, to: number) => {
              console.log(`🔄 Mock: ${table}.select(${columns}).order(${column}).range(${from}, ${to})`);
              return Promise.resolve({ data: [], error: null, count: 0 });
            }
          })
        }),
        insert: (data: any) => ({
          select: (columns?: string) => ({
            maybeSingle: () => {
              console.log(`🔄 Mock: ${table}.insert().select(${columns}).maybeSingle()`);
              return Promise.resolve({ data: null, error: null });
            }
          })
        }),
        upsert: (data: any, options?: any) => {
          console.log(`🔄 Mock: ${table}.upsert()`);
          return Promise.resolve({ error: null });
        }
      })
    };
  } else {
    console.log('✅ Initializing Supabase client with provided credentials');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Fallback to mock client
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithOtp: () => Promise.resolve({ error: new Error('Supabase initialization failed') }),
      verifyOtp: () => Promise.resolve({ error: new Error('Supabase initialization failed') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback: any) => {
        setTimeout(() => callback('SIGNED_OUT', null), 0);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => ({ range: () => Promise.resolve({ data: [], error: null, count: 0 }) })
        })
      }),
      insert: () => ({ select: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
      upsert: () => Promise.resolve({ error: null })
    })
  };
}

export { supabase };
