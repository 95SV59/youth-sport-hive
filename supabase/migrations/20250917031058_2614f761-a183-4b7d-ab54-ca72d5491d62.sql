-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'coach'
  );
$$;

-- Profiles table policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Sports categories policies (public read access)
CREATE POLICY "Anyone can view sports categories"
  ON public.sports_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sports categories"
  ON public.sports_categories FOR ALL
  USING (public.is_admin());

-- Coaches table policies
CREATE POLICY "Coaches can view their own coach profile"
  ON public.coaches FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Coaches can update their own coach profile"
  ON public.coaches FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Coaches can insert their own coach profile"
  ON public.coaches FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view verified coaches"
  ON public.coaches FOR SELECT
  USING (is_verified = true);

CREATE POLICY "Admins can manage all coach profiles"
  ON public.coaches FOR ALL
  USING (public.is_admin());

-- Events table policies
CREATE POLICY "Anyone can view approved events"
  ON public.events FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Coaches can view their own events"
  ON public.events FOR SELECT
  USING (
    coach_id IN (
      SELECT id FROM public.coaches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    coach_id IN (
      SELECT id FROM public.coaches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update their own events"
  ON public.events FOR UPDATE
  USING (
    coach_id IN (
      SELECT id FROM public.coaches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL
  USING (public.is_admin());

-- Event registrations policies
CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own registrations"
  ON public.event_registrations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own registrations"
  ON public.event_registrations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Coaches can view registrations for their events"
  ON public.event_registrations FOR SELECT
  USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.coaches c ON e.coach_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all registrations"
  ON public.event_registrations FOR ALL
  USING (public.is_admin());

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all achievements"
  ON public.user_achievements FOR ALL
  USING (public.is_admin());

-- Gamification stats policies
CREATE POLICY "Users can view their own stats"
  ON public.gamification_stats FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own stats"
  ON public.gamification_stats FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create stats"
  ON public.gamification_stats FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all stats"
  ON public.gamification_stats FOR SELECT
  USING (public.is_admin());

-- Recommendations policies
CREATE POLICY "Users can view their own recommendations"
  ON public.recommendations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own recommendations"
  ON public.recommendations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all recommendations"
  ON public.recommendations FOR ALL
  USING (public.is_admin());

-- Ratings and reviews policies
CREATE POLICY "Anyone can view verified reviews"
  ON public.ratings_reviews FOR SELECT
  USING (is_verified = true);

CREATE POLICY "Users can view their own reviews"
  ON public.ratings_reviews FOR SELECT
  USING (reviewer_id = auth.uid());

CREATE POLICY "Users can create reviews for events they attended"
  ON public.ratings_reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.event_registrations
      WHERE event_id = ratings_reviews.event_id
      AND user_id = auth.uid()
      AND attended = true
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON public.ratings_reviews FOR UPDATE
  USING (reviewer_id = auth.uid());

CREATE POLICY "Coaches can view reviews for their events"
  ON public.ratings_reviews FOR SELECT
  USING (
    coach_id IN (
      SELECT id FROM public.coaches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all reviews"
  ON public.ratings_reviews FOR ALL
  USING (public.is_admin());

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications"
  ON public.notifications FOR ALL
  USING (public.is_admin());