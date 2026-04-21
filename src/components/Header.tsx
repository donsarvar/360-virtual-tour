import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-strong">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Tashkent360 Logo" className="h-10 w-auto" />
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
