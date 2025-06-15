
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Home, Database } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const MobileSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) => {
    const onLinkClick = () => setIsOpen(false);

    const getNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
    );

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent className="bg-gray-100 p-0 w-72">
                <div className="flex items-center p-4 border-b h-16">
                    <h1 className="text-2xl font-bold text-primary">Milk Inventory</h1>
                </div>
                <nav className="space-y-2 p-4">
                    <NavLink to="/" end onClick={onLinkClick} className={getNavCls}>
                        <Home className="mr-3 h-5 w-5" />
                        Dashboard
                    </NavLink>
                    <NavLink to="/master-data" onClick={onLinkClick} className={getNavCls}>
                        <Database className="mr-3 h-5 w-5" />
                        Master Data
                    </NavLink>
                </nav>
            </DrawerContent>
        </Drawer>
    );
}

export default MobileSidebar;
