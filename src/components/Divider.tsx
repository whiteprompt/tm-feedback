const Divider = () => {
  return (
    <div className="w-full">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4">
          <div className={`
            h-[2px] flex-1 bg-linear-to-r from-transparent via-cyan-400
            to-cyan-400
          `}></div>
          <div className={`
            h-3 w-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50
          `}></div>
          <div className={`
            h-[2px] flex-1 bg-linear-to-r from-cyan-400 to-transparent
          `}></div>
        </div>
    </div>
  );
};

export default Divider;