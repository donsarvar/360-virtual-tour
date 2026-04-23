import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-strong">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Tashkent360 Logo" className="h-8 sm:h-10 w-auto" />
          <span className="text-lg sm:text-xl font-display font-bold tracking-tight whitespace-nowrap">
            <span className="text-foreground">Tashkent</span>
            <span className="text-gradient ml-1">360</span>
          </span>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
