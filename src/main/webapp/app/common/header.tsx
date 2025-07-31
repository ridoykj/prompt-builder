import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


export default function Header() {
  const { t } = useTranslation();
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
    <header ref={headerRef} className="bg-white border-b">
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex flex-wrap items-center justify-between py-2">
          <Link to="/" className="flex items-center py-1.5 mr-4">
            <img src="/images/logo.png" alt="LLM Analyzer" width="30" height="30" className="inline-block" />
            <span className="text-xl pl-3 font-semibold">LLM Analyzer</span>
          </Link>
          <button type="button" className="js-dropdown md:hidden border rounded cursor-pointer" data-dropdown-keepopen="true"
              aria-label={t('navigation.toggle')} aria-controls="navbarToggle" aria-expanded="false">
            <div className="space-y-1.5 my-2.5 mx-4">
              <div className="w-6 h-0.5 bg-gray-500"></div>
              <div className="w-6 h-0.5 bg-gray-500"></div>
              <div className="w-6 h-0.5 bg-gray-500"></div>
            </div>
          </button>
          <div className="hidden md:flex items-center grow md:grow-0 justify-end basis-full md:basis-auto pt-3 md:pt-1 pb-1" id="navbarToggle">
            <div className="relative">
              <button type="button" className="js-dropdown flex items-center" aria-expanded="false">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-700 font-semibold">
                  G
                </span>
              </button>
              <div className="hidden absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border py-1 z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold">Guest</p>
                  <p className="text-xs text-gray-500">guest@example.com</p>
                </div>
                <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                <div className="border-t"></div>
                <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign in</Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
