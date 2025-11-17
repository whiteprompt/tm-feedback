const Divider = () => {
  return (
    <div className="w-full">
        <div className="flex items-center gap-4 max-w-7xl mx-auto px-4">
          <div className="flex-1 h-[2px] bg-linear-to-r from-transparent via-cyan-400 to-cyan-400"></div>
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
          <div className="flex-1 h-[2px] bg-linear-to-r from-cyan-400 to-transparent"></div>
        </div>
    </div>
  );
};

export default Divider;