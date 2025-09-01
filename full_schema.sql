

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insert into profiles table with proper error handling
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."faq_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "site_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "category" "text",
    "order_index" integer DEFAULT 0,
    "is_published" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."faq_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."faq_sites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "domain" "text",
    "theme" "jsonb" DEFAULT '{"layout": "modern", "textColor": "#1f2937", "fontFamily": "Inter", "borderRadius": "8px", "primaryColor": "#3b82f6", "secondaryColor": "#64748b", "backgroundColor": "#ffffff"}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_domain_format" CHECK ((("domain" ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'::"text") AND ("length"("domain") <= 63)))
);


ALTER TABLE "public"."faq_sites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "site_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."site_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."sites" OWNER TO "postgres";


ALTER TABLE ONLY "public"."faq_items"
    ADD CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."faq_sites"
    ADD CONSTRAINT "faq_sites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_categories"
    ADD CONSTRAINT "site_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_categories"
    ADD CONSTRAINT "site_categories_site_id_name_key" UNIQUE ("site_id", "name");



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."faq_sites"
    ADD CONSTRAINT "unique_domain" UNIQUE ("domain");



CREATE INDEX "idx_faq_items_category" ON "public"."faq_items" USING "btree" ("category");



CREATE INDEX "idx_faq_items_order" ON "public"."faq_items" USING "btree" ("site_id", "order_index");



CREATE INDEX "idx_faq_items_site_id" ON "public"."faq_items" USING "btree" ("site_id");



CREATE INDEX "idx_faq_sites_user_id" ON "public"."faq_sites" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_faq_items_updated_at" BEFORE UPDATE ON "public"."faq_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_faq_sites_updated_at" BEFORE UPDATE ON "public"."faq_sites" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."faq_items"
    ADD CONSTRAINT "faq_items_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."faq_sites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."faq_sites"
    ADD CONSTRAINT "faq_sites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_categories"
    ADD CONSTRAINT "site_categories_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."faq_sites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow service role to insert profiles" ON "public"."profiles" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable delete access for site owners" ON "public"."sites" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Enable delete for site owners" ON "public"."site_categories" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."faq_sites"
  WHERE (("faq_sites"."id" = "site_categories"."site_id") AND ("faq_sites"."user_id" = "auth"."uid"())))));



CREATE POLICY "Enable insert access for authenticated users" ON "public"."sites" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Enable insert for site owners" ON "public"."site_categories" FOR INSERT TO "authenticated" WITH CHECK (("site_id" IN ( SELECT "faq_sites"."id"
   FROM "public"."faq_sites"
  WHERE ("faq_sites"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable read access for authenticated users" ON "public"."sites" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Enable read for site owners" ON "public"."site_categories" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."faq_sites"
  WHERE (("faq_sites"."id" = "site_categories"."site_id") AND ("faq_sites"."user_id" = "auth"."uid"())))));



CREATE POLICY "Enable update access for site owners" ON "public"."sites" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Enable update for site owners" ON "public"."site_categories" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."faq_sites"
  WHERE (("faq_sites"."id" = "site_categories"."site_id") AND ("faq_sites"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create FAQ items for own sites" ON "public"."faq_items" FOR INSERT TO "authenticated" WITH CHECK (("site_id" IN ( SELECT "faq_sites"."id"
   FROM "public"."faq_sites"
  WHERE ("faq_sites"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can create own sites" ON "public"."faq_sites" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete FAQ items from own sites" ON "public"."faq_items" FOR DELETE TO "authenticated" USING (("site_id" IN ( SELECT "faq_sites"."id"
   FROM "public"."faq_sites"
  WHERE ("faq_sites"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete own sites" ON "public"."faq_sites" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert own profile during signup" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can read FAQ items from own sites" ON "public"."faq_items" FOR SELECT TO "authenticated" USING (("site_id" IN ( SELECT "faq_sites"."id"
   FROM "public"."faq_sites"
  WHERE ("faq_sites"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can read own sites" ON "public"."faq_sites" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update FAQ items from own sites" ON "public"."faq_items" FOR UPDATE TO "authenticated" USING (("site_id" IN ( SELECT "faq_sites"."id"
   FROM "public"."faq_sites"
  WHERE ("faq_sites"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own sites" ON "public"."faq_sites" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."faq_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."faq_sites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sites" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."faq_items" TO "anon";
GRANT ALL ON TABLE "public"."faq_items" TO "authenticated";
GRANT ALL ON TABLE "public"."faq_items" TO "service_role";



GRANT ALL ON TABLE "public"."faq_sites" TO "anon";
GRANT ALL ON TABLE "public"."faq_sites" TO "authenticated";
GRANT ALL ON TABLE "public"."faq_sites" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."site_categories" TO "anon";
GRANT ALL ON TABLE "public"."site_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."site_categories" TO "service_role";



GRANT ALL ON TABLE "public"."sites" TO "anon";
GRANT ALL ON TABLE "public"."sites" TO "authenticated";
GRANT ALL ON TABLE "public"."sites" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
