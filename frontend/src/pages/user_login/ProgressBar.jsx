const ProgressBar = ({ step, theme }) => {
  return (
    <div className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2.5 mb-6`}>
      <div
        className="bg-blue-400 h-2.5 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${(step / 3) * 100}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;