
-- Create tankers table
CREATE TABLE public.tankers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bmcs table
CREATE TABLE public.bmcs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testers table
CREATE TABLE public.testers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create milk_entries table
CREATE TABLE public.milk_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  tanker TEXT NOT NULL,
  bmc TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  quality TEXT NOT NULL,
  fat NUMERIC NOT NULL,
  snf NUMERIC NOT NULL,
  chamber INTEGER NOT NULL,
  driver TEXT NOT NULL,
  tester TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.tankers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bmcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_entries ENABLE ROW LEVEL SECURITY;

-- Policies for tankers
CREATE POLICY "Allow authenticated users to read tankers" ON public.tankers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert tankers" ON public.tankers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update tankers" ON public.tankers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete tankers" ON public.tankers FOR DELETE TO authenticated USING (true);

-- Policies for bmcs
CREATE POLICY "Allow authenticated users to read bmcs" ON public.bmcs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert bmcs" ON public.bmcs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update bmcs" ON public.bmcs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete bmcs" ON public.bmcs FOR DELETE TO authenticated USING (true);

-- Policies for drivers
CREATE POLICY "Allow authenticated users to read drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert drivers" ON public.drivers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update drivers" ON public.drivers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete drivers" ON public.drivers FOR DELETE TO authenticated USING (true);

-- Policies for testers
CREATE POLICY "Allow authenticated users to read testers" ON public.testers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert testers" ON public.testers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update testers" ON public.testers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete testers" ON public.testers FOR DELETE TO authenticated USING (true);

-- Policies for milk_entries
CREATE POLICY "Allow users to read their own milk entries" ON public.milk_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own milk entries" ON public.milk_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own milk entries" ON public.milk_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own milk entries" ON public.milk_entries FOR DELETE USING (auth.uid() = user_id);

-- Insert initial data
INSERT INTO public.tankers (name) VALUES ('T-001'), ('T-002'), ('T-003');
INSERT INTO public.bmcs (name) VALUES ('BMC-A'), ('BMC-B'), ('BMC-C');
INSERT INTO public.drivers (name) VALUES ('John Doe'), ('Jane Smith');
INSERT INTO public.testers (name) VALUES ('Peter Jones'), ('Mary Williams');
