import { BarChart3, Calendar, Home, Menu, Pill, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Pharmacy', href: '/pharmacy', icon: Pill },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];