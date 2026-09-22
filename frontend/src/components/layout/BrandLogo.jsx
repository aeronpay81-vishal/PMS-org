import logo from "../../../public/logo.png";
const BrandLogo = ({ collapsed = false, isDark = false }) => {
  const titleColor = isDark ? "#F8FAFC" : "#172B4D";
  const subtitleColor = isDark ? "#9AA8BC" : "#626F86";

  return (
    <div className="flex min-w-0 items-center gap-2.5 ml-4 mt-2">
     
        <img src={logo} alt="Logo" className="h-12 w-34" />
    

      
    </div>
  );
};

export default BrandLogo;
