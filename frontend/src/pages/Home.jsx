import Login from './Login'
import Feature from './Feature'
import HowItWork from './HowItWork'
import Pricing from './Pricing'
import Faq from './Faq'

const Home = ({ onLogin }) => (
  <main>
    <Login onLogin={onLogin} showFooter={false} />
    <section id="features">
      <Feature showChrome={false} />
    </section>
    <section id="how-it-works">
      <HowItWork showChrome={false} />
    </section>
    <section id="pricing">
      <Pricing showChrome={false} />
    </section>
    <section id="faq">
      <Faq showChrome={false} />
    </section>
  </main>
)
export default Home