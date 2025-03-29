
import { Calculator } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-engineer-primary text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator size={24} />
          <h1 className="text-xl font-bold">Beam Calculator Hub</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="hover:text-gray-200 transition-colors">Home</a>
            </li>
            <li>
              <a href="#about" className="hover:text-gray-200 transition-colors">About</a>
            </li>
            <li>
              <a href="#help" className="hover:text-gray-200 transition-colors">Help</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
