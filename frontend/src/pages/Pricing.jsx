import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "../components/navigation/Navbar";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    tagline: "For small teams getting organized",
    features: ["Up to 5 teammates", "3 active projects", "Basic boards & lists", "Community support"],
    highlight: false,
    cta: "Get started",
  },
  {
    name: "Team",
    price: "$9",
    period: "/user/mo",
    tagline: "For teams that need reporting and automation",
    features: [
      "Unlimited projects",
      "Automated reminders",
      "Live reporting & burndown",
      "Priority support",
    ],
    highlight: true,
    cta: "Start free trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "For organizations with security & scale needs",
    features: ["SSO & audit logs", "Dedicated onboarding", "Custom integrations", "SLA-backed support"],
    highlight: false,
    cta: "Contact sales",
  },
];

const Pricing = ({ showChrome = true }) => (
  <div className={`${showChrome ? "marketing-page" : ""}`}>
    {showChrome && <Navbar activePage="pricing" />}

    <section className={`mx-auto max-w-6xl px-4 ${showChrome ? "py-16 sm:px-6" : "py-12 sm:px-8"}`}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0C66E4]">Pricing</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#172B4D] sm:text-5xl">Simple pricing, no surprises</h1>
        <p className="mt-4 text-[15px] leading-7 text-[#44546F]">Start free. Upgrade only when your team needs more power, automation, and support.</p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`marketing-card flex flex-col p-6 ${plan.highlight ? "border-[#0C66E4] ring-2 ring-[#0C66E4]/15" : ""
              }`}
          >
            {plan.highlight && (
              <span className="mb-3 w-fit rounded bg-[#0C66E4] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Most popular
              </span>
            )}
            <h3 className="text-[18px] font-semibold text-[#172B4D]">{plan.name}</h3>
            <p className="mt-1 text-[13px] text-[#626F86]">{plan.tagline}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="text-[36px] font-semibold leading-none tracking-tight text-[#172B4D]">
                {plan.price}
              </span>
              {plan.period && <span className="pb-1 text-[13px] text-[#626F86]">{plan.period}</span>}
            </div>

            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[13px] text-[#44546F]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1F845A]" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to={plan.price === "Custom" ? "/contact" : "/"}
              className={`mt-8 flex h-10 items-center justify-center rounded text-[13px] font-medium ${plan.highlight
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "border border-[#DCDFE4] text-[#172B4D] hover:bg-[#F1F2F4]"
                }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-[13px] text-[#626F86]">
        All plans include unlimited viewers · No credit card required on Starter
      </p>
    </section>

    {showChrome && <Footer />}
  </div>
);

export default Pricing;
