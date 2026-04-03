-- Create tables for VITAMEND application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicine_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  expiry_date DATE NOT NULL,
  condition TEXT NOT NULL,
  category TEXT NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT NOT NULL,
  donor_address TEXT NOT NULL,
  notes TEXT,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'distributed', 'rejected')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicines table (verified medicines available for distribution)
CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  expiry_date DATE NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT TRUE,
  image_urls TEXT[] DEFAULT '{}',
  donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  date_of_birth DATE,
  occupation TEXT,
  experience TEXT,
  availability TEXT,
  role TEXT,
  motivation TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  has_transport BOOLEAN DEFAULT FALSE,
  can_lift BOOLEAN DEFAULT FALSE,
  medical_conditions TEXT,
  "references" TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medicines_available ON medicines(available);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for donations (anyone can submit, only admins can update)
CREATE POLICY "Anyone can submit donations" ON donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view donations" ON donations
  FOR SELECT USING (true);

CREATE POLICY "Admins can update donations" ON donations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for medicines (public read, admin write)
CREATE POLICY "Anyone can view available medicines" ON medicines
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert medicines" ON medicines
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update medicines" ON medicines
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for volunteers (anyone can apply, admins can view all)
CREATE POLICY "Anyone can submit volunteer applications" ON volunteers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Volunteers can view their own application" ON volunteers
  FOR SELECT USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update volunteer status" ON volunteers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
