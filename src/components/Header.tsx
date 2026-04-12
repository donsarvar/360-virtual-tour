import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-strong">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-display font-bold tracking-tight">
          <span className="text-foreground">Tashkent</span>
          <span className="text-gradient">360</span>
        </h2>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
