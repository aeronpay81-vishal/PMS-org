import Login from "./Login";
import Feature from "./Feature";
import HowItWork from "./HowItWork";
import Pricing from "./Pricing";
import Faq from "./Faq";
import Contact from "./Contact";
import Footer from "./Footer";
import AIAssistant from "./Aiassistent";
const Home = ({ onLogin }) => (
  <main className="bg-[#F7F8F9]">
    <Login onLogin={onLogin} showFooter={false} />
    <div className="h-px bg-[#DCDFE4]" />
    <section id="features">
      <Feature showChrome={false} />
    </section>
    <div className="h-px bg-[#DCDFE4]" />
    <section id="how-it-works">
      <HowItWork showChrome={false} />
    </section>
    <div className="h-px bg-[#DCDFE4]" />
    <section id="pricing">
      <Pricing showChrome={false} />
    </section>
    <div className="h-px bg-[#DCDFE4]" />
    <section id="faq">
      <Faq showChrome={false} />
    </section>
    <div className="h-px bg-[#DCDFE4]" />
    <section id="contact">
      <Contact showChrome={false} />
    </section>
    <AIAssistant />
    <Footer />
  </main>
);

export default Home;
