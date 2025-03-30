
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-anime-background/80 backdrop-blur-md border-b border-anime-primary/20">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/d956edaf-7df3-49eb-99fa-e8a047d2e005.png" 
                alt="Aikacuwen Logo" 
                className="h-8 md:h-10" 
              />
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/" isActive={isActive('/')}>Home</NavLink>
              <NavLink to="/browse" isActive={isActive('/browse')}>Browse</NavLink>
              <NavLink to="/recently-added" isActive={isActive('/recently-added')}>Recently Added</NavLink>
            </div>
          </div>
          
          {/* Search and Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-anime-text">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <Link to="/admin" className="hidden md:block">
              <Button variant="outline" size="sm" className="border-anime-primary text-anime-primary hover:bg-anime-primary/10">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-anime-card px-4 py-2 animate-fade-in">
          <div className="flex flex-col space-y-3 py-3">
            <MobileNavLink to="/" isActive={isActive('/')} onClick={toggleMenu}>Home</MobileNavLink>
            <MobileNavLink to="/browse" isActive={isActive('/browse')} onClick={toggleMenu}>Browse</MobileNavLink>
            <MobileNavLink to="/recently-added" isActive={isActive('/recently-added')} onClick={toggleMenu}>Recently Added</MobileNavLink>
            <MobileNavLink to="/admin" isActive={isActive('/admin')} onClick={toggleMenu}>Admin Panel</MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

type NavLinkProps = {
  children: React.ReactNode;
  to: string;
  isActive: boolean;
  onClick?: () => void;
};

const NavLink = ({ children, to, isActive }: NavLinkProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive 
          ? "text-anime-primary bg-anime-primary/10" 
          : "text-anime-text hover:text-anime-primary hover:bg-anime-primary/5"
      )}
    >
      {children}
    </Link>
  );
};

const MobileNavLink = ({ children, to, isActive, onClick }: NavLinkProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "px-3 py-2 text-base font-medium rounded-md transition-colors block",
        isActive 
          ? "text-anime-primary bg-anime-primary/10" 
          : "text-anime-text hover:text-anime-primary hover:bg-anime-primary/5"
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default NavBar;
