// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zpgbnrgwbxayqxubztld.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZ2Jucmd3YnhheXF4dWJ6dGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzg1NDAsImV4cCI6MjA1ODg1NDU0MH0.fl-lVyQ9U4BhHVkshZ-IKGvP_ezPyh08EX4W-2EX9zo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);