import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  Trophy,
  Bell,
  LogOut,
  Shield,
  Plus,
  User,
  BarChart3,
  Lightbulb
} from 'lucide-react';

const Sidebar = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  const getNavigationItems = () => {
    const role = profile?.role || 'student';
    
    // Base items for all users
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Calendar, label: 'Events', path: '/events' },
      { icon: Lightbulb, label: 'Recommendations', path: '/recommendations' },
      { icon: Trophy, label: 'Challenges', path: '/challenges' },
      { icon: User, label: 'Profile', path: '/profile' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
    ];

    // Coach-specific items
    if (role === 'coach') {
      baseItems.splice(2, 0, 
        { icon: Plus, label: 'Create Event', path: '/create-event' },
        { icon: Users, label: 'My Events', path: '/my-events' }
      );
      baseItems.push({ icon: BarChart3, label: 'Analytics', path: '/analytics' });
    }

    // Admin-specific items
    if (role === 'admin') {
      baseItems.splice(2, 0,
        { icon: Plus, label: 'Create Event', path: '/create-event' },
        { icon: Users, label: 'My Events', path: '/my-events' }
      );
      baseItems.push(
        { icon: Shield, label: 'Admin Panel', path: '/admin' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'coach': return 'bg-primary text-primary-foreground';
      case 'parent': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col min-h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Youth Sports</h1>
        <p className="text-sm text-sidebar-foreground/70">Platform</p>
      </div>

      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
              {profile?.first_name?.[0] || 'U'}{profile?.last_name?.[0] || ''}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.first_name || 'User'} {profile?.last_name || ''}
            </p>
            <Badge variant="secondary" className={`text-xs mt-1 ${getRoleColor(profile?.role || '')}`}>
              {getRoleLabel(profile?.role || '')}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive(item.path)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
