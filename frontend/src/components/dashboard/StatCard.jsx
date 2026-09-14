const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "indigo",
  hint,
  progress,
}) => {
  const styles = {
    indigo: {
      icon: "bg-[#E9F2FF] text-[#0C66E4] dark:bg-blue-500/15 dark:text-blue-300",
      bar: "bg-[#0C66E4]",
    },
    emerald: {
      icon: "bg-[#DCFFF1] text-[#1F845A] dark:bg-emerald-500/15 dark:text-emerald-300",
      bar: "bg-[#1F845A]",
    },
    amber: {
      icon: "bg-[#FFF7D6] text-[#946F00] dark:bg-amber-500/15 dark:text-amber-300",
      bar: "bg-[#E2B203]",
    },
    violet: {
      icon: "bg-[#F3F0FF] text-[#6E5DC6] dark:bg-violet-500/15 dark:text-violet-300",
      bar: "bg-[#6E5DC6]",
    },
  };

  const style = styles[color] || styles.indigo;
  const showProgress = typeof progress === "number" && !Number.isNaN(progress);
  const clamped = showProgress ? Math.max(0, Math.min(100, progress)) : 0;

  return (
    <div className="rounded border border-[#DCDFE4] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#626F86] dark:text-slate-400">{title}</p>
          <p className="mt-1 text-[28px] font-semibold leading-none tracking-tight text-[#172B4D] dark:text-white">
            {value}
          </p>
          {hint && (
            <p className="mt-2 text-[12px] text-[#626F86] dark:text-slate-400">{hint}</p>
          )}
        </div>

        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${style.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {showProgress && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#F1F2F4] dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${style.bar}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default StatCard;
