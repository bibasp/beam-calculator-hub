
const Footer = () => {
  return (
    <footer className="bg-engineer-secondary text-white py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} Beam Calculator Hub</p>
          </div>
          <div>
            <p className="text-sm">Created for structural engineers & students</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
