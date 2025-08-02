
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    birthday DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    university TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    flyer_url TEXT,
    is_private BOOLEAN DEFAULT false,
    require_approval BOOLEAN DEFAULT false,
    allow_plus_one BOOLEAN DEFAULT false,
    join_type TEXT DEFAULT 'rsvp' CHECK (join_type IN ('rsvp', 'tickets')),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    capacity INTEGER,
    sold_count INTEGER DEFAULT 0, -- Track how many tickets have been sold
    ticket_type TEXT DEFAULT 'custom' CHECK (ticket_type IN ('custom', 'presale', 'door')),
    start_sale_date TIMESTAMP WITH TIME ZONE,
    end_sale_date TIMESTAMP WITH TIME ZONE,
    require_approval BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RSVPs table (for free events)
CREATE TABLE public.rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'not_going', 'maybe')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Create ticket purchases table (for paid events)
CREATE TABLE public.ticket_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    qr_code TEXT, -- For ticket validation
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled')),
    stripe_payment_intent_id TEXT, -- For tracking Stripe payments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event attendees table (combines RSVPs and ticket holders)
CREATE TABLE public.event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    attendance_type TEXT CHECK (attendance_type IN ('rsvp', 'ticket')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    check_in_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Create saved events table (user bookmarks)
CREATE TABLE public.saved_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_events_host_id ON public.events(host_id);
CREATE INDEX idx_events_date_time ON public.events(date_time);
CREATE INDEX idx_events_location ON public.events(location);
CREATE INDEX idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX idx_rsvps_event_id ON public.rsvps(event_id);
CREATE INDEX idx_rsvps_user_id ON public.rsvps(user_id);
CREATE INDEX idx_ticket_purchases_user_id ON public.ticket_purchases(user_id);
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX idx_saved_events_user_id ON public.saved_events(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for events
CREATE POLICY "Users can view public events or own events" ON public.events FOR SELECT USING (
    NOT is_private OR host_id = auth.uid()
);
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = host_id);

-- Create RLS policies for tickets
CREATE POLICY "Users can view tickets for accessible events" ON public.tickets FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = tickets.event_id 
        AND (NOT events.is_private OR events.host_id = auth.uid())
    )
);
CREATE POLICY "Event hosts can manage tickets" ON public.tickets FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = tickets.event_id 
        AND events.host_id = auth.uid()
    )
);

-- Create RLS policies for RSVPs
CREATE POLICY "Users can view RSVPs for accessible events" ON public.rsvps FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = rsvps.event_id 
        AND (NOT events.is_private OR events.host_id = auth.uid())
    )
    OR user_id = auth.uid()
);
CREATE POLICY "Users can manage own RSVPs" ON public.rsvps FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for ticket purchases
CREATE POLICY "Users can view own ticket purchases" ON public.ticket_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ticket purchases" ON public.ticket_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Event hosts can view ticket purchases for their events" ON public.ticket_purchases FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.tickets 
        JOIN public.events ON events.id = tickets.event_id 
        WHERE tickets.id = ticket_purchases.ticket_id 
        AND events.host_id = auth.uid()
    )
);

-- Create RLS policies for event attendees
CREATE POLICY "Users can view attendees for accessible events" ON public.event_attendees FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = event_attendees.event_id 
        AND (NOT events.is_private OR events.host_id = auth.uid())
    )
    OR user_id = auth.uid()
);
CREATE POLICY "Users can manage own attendance" ON public.event_attendees FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for saved events
CREATE POLICY "Users can manage own saved events" ON public.saved_events FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
