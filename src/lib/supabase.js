import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations

// ==================== AUTH ====================
export const auth = {
  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ==================== PROFILES ====================
export const profiles = {
  // Get profile by user ID
  getById: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Update profile
  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Create profile (usually done via trigger, but just in case)
  create: async (profile) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    return { data, error };
  },

  // Get all providers (for client map)
  getProviders: async (filters = {}) => {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'provider')
      .eq('status', 'active');
    
    if (filters.verified) {
      query = query.eq('verified', true);
    }
    
    const { data, error } = await query;
    return { data, error };
  }
};

// ==================== PROPERTIES ====================
export const properties = {
  // Get all properties for a user
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get single property
  getById: async (propertyId) => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();
    return { data, error };
  },

  // Create property
  create: async (property) => {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();
    return { data, error };
  },

  // Update property
  update: async (propertyId, updates) => {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single();
    return { data, error };
  },

  // Delete property
  delete: async (propertyId) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    return { error };
  }
};

// ==================== JOBS ====================
export const jobs = {
  // Get all jobs for a client
  getByClientId: async (clientId) => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        property:properties(*),
        provider:profiles!jobs_provider_id_fkey(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get all jobs for a provider
  getByProviderId: async (providerId) => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        property:properties(*),
        client:profiles!jobs_client_id_fkey(*)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get available jobs for providers (status = searching)
  getAvailable: async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        property:properties(*),
        client:profiles!jobs_client_id_fkey(*)
      `)
      .eq('status', 'searching')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get single job
  getById: async (jobId) => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        property:properties(*),
        provider:profiles!jobs_provider_id_fkey(*),
        client:profiles!jobs_client_id_fkey(*)
      `)
      .eq('id', jobId)
      .single();
    return { data, error };
  },

  // Create job
  create: async (job) => {
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
      .single();
    return { data, error };
  },

  // Update job status
  updateStatus: async (jobId, status, additionalData = {}) => {
    const { data, error } = await supabase
      .from('jobs')
      .update({ status, ...additionalData, updated_at: new Date().toISOString() })
      .eq('id', jobId)
      .select()
      .single();
    return { data, error };
  },

  // Assign provider to job
  assignProvider: async (jobId, providerId) => {
    const { data, error } = await supabase
      .from('jobs')
      .update({ 
        provider_id: providerId, 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();
    return { data, error };
  }
};

// ==================== OFFERS ====================
export const offers = {
  // Get offers for a job
  getByJobId: async (jobId) => {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        provider:profiles(*)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  // Create offer
  create: async (offer) => {
    const { data, error } = await supabase
      .from('offers')
      .insert(offer)
      .select()
      .single();
    return { data, error };
  },

  // Accept offer
  accept: async (offerId) => {
    const { data, error } = await supabase
      .from('offers')
      .update({ status: 'accepted' })
      .eq('id', offerId)
      .select()
      .single();
    return { data, error };
  },

  // Reject offer
  reject: async (offerId) => {
    const { data, error } = await supabase
      .from('offers')
      .update({ status: 'rejected' })
      .eq('id', offerId)
      .select()
      .single();
    return { data, error };
  }
};

// ==================== RATINGS ====================
export const ratings = {
  // Create rating
  create: async (rating) => {
    const { data, error } = await supabase
      .from('ratings')
      .insert(rating)
      .select()
      .single();
    return { data, error };
  },

  // Get ratings for a user
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('rated_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  }
};

export default supabase;
