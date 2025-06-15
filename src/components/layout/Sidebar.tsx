
import { NavLink } from 'react-router-dom';
import { Home, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-100 p-4 border-r hidden md:block">
      <div className="flex items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Milk Inventory</h1>
      </div>
      <nav className="space-y-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'flex items-center px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            )
          }
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        <NavLink
          to="/master-data"
          className={({ isActive }) =>
            cn(
              'flex items-center px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            )
          }
        >
          <Database className="mr-3 h-5 w-5" />
          Master Data
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
