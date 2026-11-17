CREATE TABLE public.demo_push_devices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 token text NOT NULL,
 label text NOT NULL DEFAULT 'Mi celular',
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (user_id, token)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_push_devices TO authenticated;
GRANT ALL ON public.demo_push_devices TO service_role;
ALTER TABLE public.demo_push_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_devices ON public.demo_push_devices FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TABLE public.demo_push_events (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'sending',
 detail text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.demo_push_events TO authenticated;
GRANT ALL ON public.demo_push_events TO service_role;
ALTER TABLE public.demo_push_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_own_events ON public.demo_push_events FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY insert_own_events ON public.demo_push_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY update_own_events ON public.demo_push_events FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());