import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  Trophy,
  MapPin,
  Star,
  Bell,
  Settings,
  LogOut,
  UserCheck,
  Shield,
  Plus,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getNavigationItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Calendar, label: 'Events', path: '/events' },
      { icon: User, label: 'Profile', path: '/profile' },
      { icon: Trophy, label: 'Achievements', path: '/achievements' },
      { icon: MapPin, label: 'Community Map', path: '/community-map' },
      { icon: Star, label: 'Reviews', path: '/reviews' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
    ];

    if (profile?.role === 'coach') {
      baseItems.splice(3, 0, 
        { icon: Plus, label: 'Create Event', path: '/create-event' },
        { icon: Users, label: 'My Events', path: '/my-events' }
      );
    }

    if (profile?.role === 'admin') {
      baseItems.push(
        { icon: Shield, label: 'Admin Panel', path: '/admin' },
        { icon: UserCheck, label: 'Coach Verification', path: '/coach-verification' }
      );
    }

    baseItems.push({ icon: Settings, label: 'Settings', path: '/settings' });

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

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Youth Sports</h1>
        <p className="text-sm text-sidebar-foreground/70">Platform</p>
      </div>

      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
            <Badge variant="secondary" className={`text-xs mt-1 ${getRoleColor(profile?.role)}`}>
              {profile?.role}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
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
          onClick={signOut}
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

export { Sidebar };