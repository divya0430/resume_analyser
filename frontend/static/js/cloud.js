/* ===================================================
   Aarti TalentForge — OPTIONAL cloud sync (Supabase)
   ---------------------------------------------------
   This module is a SCAFFOLD. It is NOT loaded by
   index.html by default, so the app stays 100% static
   and offline until YOU choose to enable shared storage.

   WHY IT'S OPTIONAL:
   Shared, multi-user data needs a backend + your own
   project credentials. You cannot safely hard-code a
   service key in a public static site. Supabase's
   "anon" key is designed for browser use, but you must
   protect data with Row Level Security (RLS) policies.

   HOW TO ENABLE (summary — see README "Shared storage"):
   1. Create a free project at https://supabase.com
   2. Create a table `candidates` (columns matching the
      candidate object: id, name, dept, score, stage, ...).
   3. Enable RLS and add policies for your HR team / auth.
   4. Fill SUPABASE_URL and SUPABASE_ANON_KEY below.
   5. Add these two <script> tags to index.html BEFORE app.js:
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
        <script src="js/cloud.js"></script>
   6. In app.js, replace loadCandidates()/saveCandidates()
      with Cloud.load()/Cloud.save() (or call Cloud.sync()).
   =================================================== */

const SUPABASE_URL = '';        // e.g. 'https://xxxx.supabase.co'
const SUPABASE_ANON_KEY = '';   // your project's anon public key

const Cloud = {
  enabled: false,
  client: null,

  init() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !window.supabase) {
      console.info('[Cloud] Supabase not configured — staying in local-only mode.');
      return false;
    }
    this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.enabled = true;
    return true;
  },

  async load() {
    if (!this.enabled) return null;
    const { data, error } = await this.client.from('candidates').select('*');
    if (error) { console.error('[Cloud] load failed', error); return null; }
    return data;
  },

  async upsert(candidate) {
    if (!this.enabled) return;
    const { error } = await this.client.from('candidates').upsert(candidate);
    if (error) console.error('[Cloud] upsert failed', error);
  },

  async remove(id) {
    if (!this.enabled) return;
    const { error } = await this.client.from('candidates').delete().eq('id', id);
    if (error) console.error('[Cloud] delete failed', error);
  }
};

if (typeof window !== 'undefined') window.Cloud = Cloud;
