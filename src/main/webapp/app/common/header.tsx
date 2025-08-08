import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BotMessageSquare, ChevronDown, User } from 'lucide-react';


export default function Header() {
  const headerRef = useRef<HTMLElement|null>(null);

  const handleClick = (event: Event) => {
    // close any open dropdown
    const $clickedDropdown = (event.target as HTMLElement).closest('.js-dropdown');
    const $dropdowns = headerRef.current!.querySelectorAll('.js-dropdown');
    $dropdowns.forEach(($dropdown:Element) => {
      if ($clickedDropdown !== $dropdown && $dropdown.getAttribute('data-dropdown-keepopen') !== 'true') {
        $dropdown.ariaExpanded = 'false';
        $dropdown.nextElementSibling!.classList.add('hidden');
      }
    });
    // toggle selected if applicable
    if ($clickedDropdown) {
      $clickedDropdown.ariaExpanded = '' + ($clickedDropdown.ariaExpanded !== 'true');
      $clickedDropdown.nextElementSibling!.classList.toggle('hidden');
    }
  };

  useEffect(() => {
    document.body.addEventListener('click', handleClick);
    return () => document.body.removeEventListener('click', handleClick);
  }, []);

  return (
    <header ref={headerRef} className="bg-card bg-white/80 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BotMessageSquare className="h-6 w-6 text-primary" />
            <span className="">LLM Analyzer</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button type="button" className="js-dropdown flex items-center gap-2" aria-expanded="false">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground font-semibold">
                  <User className="h-5 w-5" />
                </span>
                <span className="hidden sm:inline">Guest</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
              <div className="hidden absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg border py-1 z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold">Guest</p>
                  <p className="text-xs text-muted-foreground">guest@example.com</p>
                </div>
                <Link to="#" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Profile</Link>
                <Link to="#" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Settings</Link>
                <div className="border-t my-1"></div>
                <Link to="#" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Sign in</Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
