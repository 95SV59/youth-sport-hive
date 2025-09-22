-- Create a default admin user (use this for testing)
-- Note: This will need to be connected to an actual auth user
-- The admin should sign up normally first, then this will be applied

-- Add some initial sports categories data
INSERT INTO sports_categories (name, display_name, description, icon_name) VALUES 
('basketball', 'Basketball', 'Fast-paced team sport played on a court with two hoops', 'basketball'),
('soccer', 'Soccer', 'The world''s most popular sport played with feet and a ball', 'zap'),
('tennis', 'Tennis', 'Racket sport played on a court with a net', 'target'),
('swimming', 'Swimming', 'Water-based sport for fitness and competition', 'waves'),
('volleyball', 'Volleyball', 'Team sport with a net and ball', 'volleyball'),
('baseball', 'Baseball', 'Bat and ball sport with bases', 'baseball'),
('track_field', 'Track & Field', 'Athletic events including running, jumping, and throwing', 'timer'),
('martial_arts', 'Martial Arts', 'Combat sports and self-defense disciplines', 'shield'),
('gymnastics', 'Gymnastics', 'Sport involving exercises requiring physical strength and flexibility', 'star'),
('other', 'Other Sports', 'Other sports and activities', 'activity')
ON CONFLICT (name) DO NOTHING;

-- Create some sample daily challenges
INSERT INTO daily_challenges (
    title, 
    description, 
    challenge_type, 
    sport_category, 
    target_value, 
    points_reward, 
    difficulty_level, 
    active_date, 
    expires_at
) VALUES 
(
    'First Event Attendance', 
    'Attend your first sports event this week', 
    'activity', 
    NULL, 
    1, 
    50, 
    'beginner', 
    CURRENT_DATE, 
    CURRENT_DATE + INTERVAL '7 days'
),
(
    'Basketball Skills', 
    'Practice basketball fundamentals for 30 minutes', 
    'activity', 
    'basketball', 
    30, 
    25, 
    'intermediate', 
    CURRENT_DATE, 
    CURRENT_DATE + INTERVAL '7 days'
),
(
    'Soccer Training', 
    'Complete a soccer training session', 
    'activity', 
    'soccer', 
    1, 
    30, 
    'beginner', 
    CURRENT_DATE, 
    CURRENT_DATE + INTERVAL '7 days'
)
ON CONFLICT DO NOTHING;