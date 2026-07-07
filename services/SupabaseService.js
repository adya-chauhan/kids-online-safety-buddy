// SupabaseService.js
// Handles database integration and real-time chat sync for real people.

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * 1. Upsert current user profile
 */
export const upsertProfile = async (profile) => {
  if (!supabase) return null;
  const cleanPhone = profile.phone ? profile.phone.replace(/\D/g, '') : '';
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      name: profile.name,
      role: profile.role,
      bio: profile.bio,
      email: profile.email || '',
      phone: cleanPhone,
      avatar_url: profile.avatar_url || '',
      last_updated: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error('[Supabase] Error upserting profile:', error.message);
    return null;
  }
  return data ? data[0] : null;
};

/**
 * Fetch profile by phone number (cleans phone number of formatting)
 */
export const fetchProfileByPhone = async (phone) => {
  if (!supabase) return null;
  const cleanPhone = phone.replace(/\D/g, '');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('phone', cleanPhone)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] Error fetching profile by phone:', error.message);
    return null;
  }
  return data;
};

/**
 * 2. Fetch all registered profiles
 */
export const fetchProfiles = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_updated', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching profiles:', error.message);
    return [];
  }
  return data || [];
};

/**
 * 3. Fetch chat history between two users (bidirectional)
 */
export const fetchChatHistory = async (userId, contactId) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Supabase] Error fetching chat history:', error.message);
    return [];
  }

  // Map to local message format
  return (data || []).map(m => ({
    id: m.id,
    text: m.text,
    sender: m.sender_id === userId ? 'user' : 'contact',
    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    image: m.image_url || null
  }));
};

/**
 * 4. Insert new message
 */
export const sendSupabaseMessage = async (senderId, recipientId, text, imageUrl = null) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      text: text,
      image_url: imageUrl,
      created_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error('[Supabase] Error inserting message:', error.message);
    return null;
  }
  return data ? data[0] : null;
};

/**
 * 5. Subscribe to real-time chat updates
 */
export const subscribeToRealtimeMessages = (userId, onNewMessage) => {
  if (!supabase) return null;

  const subscription = supabase
    .channel('realtime-messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      },
      (payload) => {
        const msg = payload.new;
        onNewMessage({
          id: msg.id,
          sender_id: msg.sender_id,
          recipient_id: msg.recipient_id,
          text: msg.text,
          image: msg.image_url || null,
          created_at: msg.created_at
        });
      }
    )
    .subscribe();

  return subscription;
};
