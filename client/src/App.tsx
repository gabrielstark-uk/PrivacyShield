import { Route, Switch } from 'wouter';
import { Toaster } from './components/ui/toaster';
import { AudioAnalyzer } from './components/AudioAnalyzer';
import { ThemeProvider } from './components/ThemeProvider';

// Placeholder components for new pages
const Dashboard = () => (
  <div className="container mx-auto p-6">
    <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
    <p>Welcome to PrivacyShield Dashboard</p>
  </div>
);

const Login = () => (
  <div className="container mx-auto p-6 max-w-md">
    <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
    <div className="bg-card p-6 rounded-lg shadow">
      <p className="text-center mb-4">Login form will be implemented here</p>
      <button className="w-full bg-primary text-primary-foreground p-2 rounded">Login</button>
    </div>
  </div>
);

const Register = () => (
  <div className="container mx-auto p-6 max-w-md">
    <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>
    <div className="bg-card p-6 rounded-lg shadow">
      <p className="text-center mb-4">Registration form will be implemented here</p>
      <button className="w-full bg-primary text-primary-foreground p-2 rounded">Register</button>
    </div>
  </div>
);

const Pricing = () => (
  <div className="container mx-auto p-6">
    <h1 className="text-4xl font-bold mb-6 text-center">Subscription Plans</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {['Free', 'Basic', 'Premium', 'Enterprise'].map((plan) => (
        <div key={plan} className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-2">{plan}</h2>
          <p className="mb-4">Plan details will be shown here</p>
          <button className="w-full bg-primary text-primary-foreground p-2 rounded">
            {plan === 'Free' ? 'Get Started' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  </div>
);

const Reports = () => (
  <div className="container mx-auto p-6">
    <h1 className="text-4xl font-bold mb-6">Reports</h1>
    <p>Your reports will be shown here</p>
  </div>
);

const Support = () => (
  <div className="container mx-auto p-6">
    <h1 className="text-4xl font-bold mb-6">Support</h1>
    <div className="bg-card p-6 rounded-lg shadow">
      <p className="mb-4">Chat with our AI assistant</p>
      <div className="border rounded-lg p-4 h-64 mb-4 overflow-y-auto">
        <div className="bg-muted p-3 rounded-lg mb-2 max-w-[80%]">
          Hello! I'm the PrivacyShield Assistant. How can I help you today?
        </div>
      </div>
      <div className="flex">
        <input 
          type="text" 
          className="flex-1 p-2 border rounded-l-lg" 
          placeholder="Type your message..."
        />
        <button className="bg-primary text-primary-foreground p-2 rounded-r-lg">Send</button>
      </div>
    </div>
  </div>
);

// Main layout with navigation
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <header className="bg-card shadow">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold">PrivacyShield</a>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/" className="hover:text-primary">Home</a></li>
            <li><a href="/dashboard" className="hover:text-primary">Dashboard</a></li>
            <li><a href="/reports" className="hover:text-primary">Reports</a></li>
            <li><a href="/pricing" className="hover:text-primary">Pricing</a></li>
            <li><a href="/support" className="hover:text-primary">Support</a></li>
            <li><a href="/login" className="hover:text-primary">Login</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <main className="flex-1">
      {children}
    </main>
    <footer className="bg-card p-6 text-center">
      <p>© 2023 PrivacyShield. All rights reserved.</p>
    </footer>
  </div>
);

// Home page
const Home = () => (
  <div>
    <section className="bg-primary text-primary-foreground py-20">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">PrivacyShield</h1>
        <p className="text-xl mb-8">Advanced protection against V2K, sound cannons, and non-lethal laser weapons</p>
        <div className="flex justify-center gap-4">
          <a href="/dashboard" className="bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-opacity-90">Get Started</a>
          <a href="/pricing" className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:bg-opacity-10">View Plans</a>
        </div>
      </div>
    </section>
    
    <section className="py-16 container mx-auto px-6">
      <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
          <h3 className="text-xl font-bold mb-2">Detect</h3>
          <p>Advanced algorithms detect potential threats in real-time using sophisticated signal processing.</p>
        </div>
        <div className="text-center">
          <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
          <h3 className="text-xl font-bold mb-2">Analyze</h3>
          <p>Our system analyzes the detected signals to identify the type and source of the threat.</p>
        </div>
        <div className="text-center">
          <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
          <h3 className="text-xl font-bold mb-2">Protect</h3>
          <p>Countermeasures are deployed automatically to neutralize the threat and protect you.</p>
        </div>
      </div>
    </section>
    
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">Try Our Detector</h2>
        <div className="max-w-4xl mx-auto">
          <AudioAnalyzer />
        </div>
      </div>
    </section>
  </div>
);

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="privacy-shield-theme">
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/reports" component={Reports} />
          <Route path="/support" component={Support} />
        </Switch>
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}