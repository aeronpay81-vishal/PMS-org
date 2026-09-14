const BrandLogo = ({ collapsed = false, isDark = false }) => {
  const titleColor = isDark ? "#F8FAFC" : "#172B4D";
  const subtitleColor = isDark ? "#9AA8BC" : "#626F86";

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
        style={{ background: "#0C66E4" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 1.5L14.5 8L8 14.5L1.5 8L8 1.5Z" fill="white" />
          <path d="M8 5.2L10.8 8L8 10.8L5.2 8L8 5.2Z" fill="#0C66E4" />
        </svg>
      </div>

      {!collapsed && (
        <div className="overflow-hidden leading-tight">
          <p className="truncate text-[15px] font-semibold tracking-tight" style={{ color: titleColor }}>
            AeroPilot
          </p>
          <p className="text-[10px] font-medium tracking-wide" style={{ color: subtitleColor }}>
            Work management
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
