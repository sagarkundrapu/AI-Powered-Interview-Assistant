import banner from "../assets/hero-banner.jpg";
export default function Header() {
  return (
    <header
      className="w-full h-[15vh] bg-cover bg-no-repeat bg-[50%] flex items-center justify-center text-white"
      style={{ backgroundImage: "url(https://digialps.com/wp-content/uploads/2024/08/Get-Ready-to-Meet-Your-AI-Recruiter-As-AI-Interviews-Rise-But-Concerns-Remain-1024x576.png)" }}
    >
      <h1 className="text-4xl md:text-6xl font-bold text-center drop-shadow-lg">
        AI Powered Interview Assistant
      </h1>
    </header>
  );
}
