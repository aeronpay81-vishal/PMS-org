const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  color = "indigo",
}) => {
  const styles = {
    indigo: {
      wrapper: "from-indigo-500 to-blue-500",
      icon: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-900/40",
      title: "text-indigo-500 dark:text-indigo-400",
      line: "from-indigo-400 to-blue-500",
    },
    emerald: {
      wrapper: "from-emerald-500 to-teal-500",
      icon: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-900/40",
      title: "text-emerald-500 dark:text-emerald-400",
      line: "from-emerald-400 to-teal-500",
    },
    amber: {
      wrapper: "from-amber-500 to-orange-500",
      icon: "bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-900/40",
      title: "text-amber-500 dark:text-amber-400",
      line: "from-amber-400 to-orange-500",
    },
    violet: {
      wrapper: "from-violet-500 to-purple-500",
      icon: "bg-violet-50 dark:bg-violet-950/40 text-violet-500 dark:text-violet-400 ring-1 ring-violet-100 dark:ring-violet-900/40",
      title: "text-violet-500 dark:text-violet-400",
      line: "from-violet-400 to-purple-500",
    },
  };

  const style = styles[color] || styles.indigo;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-widest ${style.title}`}>
            {title}
          </p>

          <p className="mt-2.5 text-[2.2rem] font-bold tracking-tight text-slate-800 dark:text-white leading-none">
            {value}
          </p>

          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            {description}
          </p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.icon}`}>
          <Icon className="h-[22px] w-[22px]" />
        </div>
      </div>

      {/* Bottom gradient accent line on hover */}
      <div
        className={`absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r ${style.line} transition-all duration-500 group-hover:w-full`}
      />
    </div>
  );
};

export default StatCard;