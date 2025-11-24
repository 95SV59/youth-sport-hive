# Youth Sports Platform - Testing Guide

## AI Recommendation System Testing

### 1. Sign Up as a New User

1. Navigate to `/auth`
2. Click "Sign Up"
3. Enter your details:
   - Email
   - Password (min 6 characters)
   - First Name
   - Last Name
   - Date of Birth
4. Select role: "Participant" or "Parent"
5. Click "Sign Up"

### 2. Complete Your Profile

1. After signup, navigate to `/profile`
2. Fill in additional details:
   - Location
   - Phone number (optional)
   - Bio (helps AI recommendations)
3. Save your profile

### 3. Generate AI Sport Recommendations

1. Navigate to `/recommendations`
2. Click "Get New Suggestions" button
3. Wait for AI to analyze your profile (10-30 seconds)
4. View personalized sport recommendations with:
   - Sport name
   - Confidence score (percentage match)
   - Reasoning why it's perfect for you
   - Key benefits list

### 4. Interact with Recommendations

- **Accept**: Click "I'm Interested" to be redirected to events for that sport
- **Decline**: Click "Not for Me" to mark the recommendation as not suitable
- **Refresh**: Click "Get New Suggestions" for fresh recommendations

### 5. Dashboard Integration

1. Navigate to `/dashboard`
2. View top 2 recommendations in the "AI Sport Recommendations" section
3. Click "View All" to go to recommendations page

## Testing Features

### Gamification System

1. **View Challenges**: Go to `/challenges`
2. **Start Challenge**: Click "Start Challenge" on any available challenge
3. **Track Progress**: Complete activities and see progress bars update
4. **Earn Points**: Complete challenges to earn points and badges

### Events System

1. **Browse Events**: Go to `/events`
2. **Filter Events**: Use sport type and difficulty filters
3. **Search Events**: Use search bar for specific events
4. **Register**: Click on event card to view details and register
5. **My Events**: Go to `/my-events` to see registered events

### Coach Features (Coach Role Only)

1. **Apply as Coach**: Go to `/coach-application`
2. Fill in:
   - Specializations
   - Experience years
   - Certifications
   - Hourly rate
3. Wait for admin approval
4. **Create Events**: Once approved, go to `/create-event`
5. **Manage Events**: View and edit your events at `/my-events`

### Admin Features (Admin Role Only)

1. **Admin Panel**: Go to `/admin`
2. **Approve Events**: Review and approve pending events
3. **Verify Coaches**: Review and verify coach applications
4. **Manage Users**: View all users and their profiles

## Expected Behavior

### AI Recommendations

- **First time**: Takes 10-30 seconds to generate
- **Cached**: Subsequent views within 24 hours load instantly
- **Refresh**: Force new recommendations by clicking "Get New Suggestions"
- **Personalization**: Based on age, location, profile bio, and activity history

### Error Handling

- **No profile**: Prompted to complete profile
- **Network issues**: Clear error message with retry option
- **AI timeout**: 30-second timeout with friendly error message
- **Empty state**: Helpful message when no recommendations available

## Performance Metrics

- **Recommendation Generation**: 10-30 seconds (first time)
- **Cached Load**: < 1 second
- **Event Loading**: < 2 seconds
- **Registration**: < 1 second

## Common Issues & Solutions

### Issue: "Failed to generate recommendations"
- **Solution**: Complete your profile with bio and location
- **Solution**: Try again after a few minutes

### Issue: Recommendations not updating
- **Solution**: Wait 24 hours for cache to expire or use admin panel to clear cache

### Issue: Can't register for events
- **Solution**: Ensure you're logged in and profile is complete

### Issue: Coach features not visible
- **Solution**: Apply as coach and wait for admin approval

## Test Scenarios

### Scenario 1: New Participant
1. Sign up
2. Complete profile
3. Get recommendations
4. Browse events
5. Register for event

### Scenario 2: Coach Workflow
1. Sign up
2. Apply as coach
3. Wait for approval
4. Create event
5. Manage registrations

### Scenario 3: Admin Workflow
1. Login as admin
2. Review pending events
3. Verify coaches
4. Monitor user activity

## Support

For issues or questions, contact the development team or check the documentation.
