import { Rocket } from "lucide-react";

const BrandLogo = ({ collapsed = false, isDark = false }) => {
  const titleColor = isDark ? "#E2E8F0" : "#0F172A";
  const subtitleColor = isDark ? "#64748B" : "#94A3B8";

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_8px_20px_-6px_rgba(37,99,235,0.55)]"
        style={{
          background: "linear-gradient(135deg, #4F7DF7 0%, #2563EB 100%)",
        }}
      >
        <Rocket
          style={{
            width: 18,
            height: 18,
            color: "#FFFFFF",
            transform: "rotate(-18deg)",
          }}
        />
      </div>

      {!collapsed && (
        <div className="overflow-hidden leading-tight">
          <p
            className="truncate text-[18px] font-bold tracking-[-0.02em]"
            style={{ color: titleColor }}
          >
            AeroPilot
          </p>
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: subtitleColor }}
          >
            Project Management
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
