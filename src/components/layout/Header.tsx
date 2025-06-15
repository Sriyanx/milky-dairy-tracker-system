
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  return (
    <header className="flex items-center justify-end h-16 px-6 bg-card border-b">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>
    </header>
  );
};

export default Header;
