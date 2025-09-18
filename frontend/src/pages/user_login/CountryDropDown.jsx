import { useState, useMemo, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa6";
import countries from "../../utils/countries";

const CountryDropDown = ({ value, onChange, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredCountries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(term) ||
        country.dialCode.includes(term)
    );
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (country) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-1/3" ref={dropdownRef}>
      <button
        type="button"
        className={`flex-shrink-0 z-10 w-full inline-flex items-center justify-between px-4 py-2 text-sm font-medium border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${theme === "dark" ? "text-white bg-gray-700 border-gray-600 hover:bg-gray-600" : "text-gray-900 bg-gray-100 border-gray-300 hover:bg-gray-200"}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{value.flag} {value.dialCode}</span>
        <FaChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-20 w-64 mt-1 ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"} border rounded-md shadow-lg max-h-60 overflow-y-auto`}>
          <div className={`sticky top-0 p-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${theme === 'dark' ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300"}`}
            />
          </div>
          <ul>
            {filteredCountries.map((country) => (
              <li
                key={country.alpha2}
                className={`px-3 py-2 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                onClick={() => handleSelect(country)}
              >
                {country.flag} ({country.dialCode}) {country.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CountryDropDown;
