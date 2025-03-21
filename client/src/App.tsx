import { Route, Switch } from 'wouter';
import { Toaster, LocalToastProvider } from './components/ui/toaster';
import { AudioAnalyzer } from './components/AudioAnalyzer';
import { ThemeProvider } from './components/ThemeProvider';
import { useState, useEffect, useRef } from 'react';

// Dashboard component
const Dashboard = () => (
  <div className="container mx-auto p-6">
    <h1 className="text-4xl font-bold mb-6">Dashboard</h1>

    {/* Stats Overview */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="dashboard-card">
        <p className="text-sm text-gray-500 mb-1">Threats Detected</p>
        <p className="dashboard-stat">12</p>
      </div>
      <div className="dashboard-card">
        <p className="text-sm text-gray-500 mb-1">Threats Neutralized</p>
        <p className="dashboard-stat">8</p>
      </div>
      <div className="dashboard-card">
        <p className="text-sm text-gray-500 mb-1">Protection Status</p>
        <p className="text-lg font-semibold text-green-600">Active</p>
      </div>
      <div className="dashboard-card">
        <p className="text-sm text-gray-500 mb-1">Subscription</p>
        <p className="text-lg font-semibold text-blue-800">Premium</p>
      </div>
    </div>

    {/* Main Dashboard Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Activity */}
      <div className="lg:col-span-2">
        <div className="macos-card p-6 h-full">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { time: '2 hours ago', event: 'V2K signal detected and neutralized', level: 'warning' },
              { time: '5 hours ago', event: 'System scan completed', level: 'info' },
              { time: 'Yesterday', event: 'Firmware updated to v2.3.1', level: 'info' },
              { time: '3 days ago', event: 'Sound cannon attack blocked', level: 'danger' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start p-3 rounded-lg bg-white shadow-sm">
                <div className={`w-3 h-3 mt-1.5 rounded-full mr-3 ${
                  activity.level === 'danger' ? 'bg-red-500' :
                  activity.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="font-medium">{activity.event}</p>
                  <p className="text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="macos-card p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full btn btn-primary flex items-center justify-center">
              <span className="mr-2">🔍</span> Run System Scan
            </button>
            <button className="w-full btn btn-secondary flex items-center justify-center">
              <span className="mr-2">🛡️</span> Activate Protection
            </button>
            <button className="w-full btn btn-secondary flex items-center justify-center">
              <span className="mr-2">📊</span> Generate Report
            </button>
            <button className="w-full btn btn-secondary flex items-center justify-center">
              <span className="mr-2">⚙️</span> Settings
            </button>
          </div>
        </div>

        <div className="macos-card p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>CPU Usage</span>
                <span>28%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Memory</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Storage</span>
                <span>62%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get redirect URL from query params
  const getRedirectUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      // Redirect to dashboard or specified redirect URL
      window.location.href = getRedirectUrl();
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-foreground">Login</h1>
      <div className="bg-card p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-foreground">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">Remember me</label>
            </div>
            <a href="#" className="text-sm text-primary hover:text-primary/80">Forgot password?</a>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground p-2 rounded"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-center text-sm mt-4 text-foreground">
            Don't have an account? <a href="/register" className="text-primary hover:text-primary/80">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-foreground">Register</h1>
      <div className="bg-card p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-foreground">Full Name</label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-foreground">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-1 text-foreground">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-foreground">
              I agree to the <a href="#" className="text-primary hover:text-primary/80">Terms of Service</a> and <a href="#" className="text-primary hover:text-primary/80">Privacy Policy</a>
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground p-2 rounded"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="text-center text-sm mt-4 text-foreground">
            Already have an account? <a href="/login" className="text-primary hover:text-primary/80">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

const Pricing = () => {
  const [plans, setPlans] = useState<Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    interval: string;
    tier: string;
    features: string[];
    active: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);

  // Fetch subscription plans when component mounts
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscription-plans');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        const data = await response.json();
        setPlans(data.plans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setIsAuthenticated(true);
          // Fetch current subscription
          const subscriptionResponse = await fetch('/api/user/subscription');
          if (subscriptionResponse.ok) {
            const data = await subscriptionResponse.json();
            setCurrentSubscription(data.subscription.tier);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    fetchPlans();
    checkAuth();
  }, []);

  // Handle subscription
  const handleSubscribe = async (planId: number) => {
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    setCheckoutLoading(planId);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();

      // If there's a URL, redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        // For free plans, just show success and redirect
        alert('Subscription updated successfully!');
        window.location.href = data.redirectUrl || '/dashboard';
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to process subscription. Please try again later.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Format price
  const formatPrice = (price: number, interval: string) => {
    if (price === 0) return 'Free';
    return `$${(price / 100).toFixed(2)}/${interval}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-4xl font-bold mb-6">Subscription Plans</h1>
        <p>Loading plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-4xl font-bold mb-6">Subscription Plans</h1>
        <p className="text-red-500">{error}</p>
        <button
          className="mt-4 bg-primary text-primary-foreground p-2 rounded"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Subscription Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-xl font-bold mb-2">{formatPrice(plan.price, plan.interval)}</p>
            <p className="mb-4">{plan.description}</p>
            <div className="mb-6">
              <h3 className="font-bold mb-2">Features:</h3>
              <ul className="list-disc pl-5">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button
              className={`w-full p-2 rounded ${
                currentSubscription === plan.tier
                  ? 'bg-green-600 text-white'
                  : 'bg-primary text-primary-foreground'
              }`}
              onClick={() => handleSubscribe(plan.id)}
              disabled={checkoutLoading === plan.id || currentSubscription === plan.tier}
            >
              {checkoutLoading === plan.id ? 'Processing...' :
                currentSubscription === plan.tier ? 'Current Plan' :
                plan.price === 0 ? 'Get Started' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Reports = () => {
  const [reports, setReports] = useState<Array<{
    id: number;
    type: string;
    status: string;
    detectionTime: Date;
    signalStrength: number;
    location?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports', {
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please log in to view your reports');
          }
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        setReports(data.reports);
        setError(null);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError(error instanceof Error ? error.message : 'Failed to load reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-foreground">Reports</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-foreground">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-card p-6 rounded-lg shadow text-center">
          <p className="text-foreground mb-4">No reports found</p>
          <p className="text-muted-foreground">When threats are detected, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-card p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{report.type}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.detectionTime).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  report.status === 'active'
                    ? 'bg-red-100 text-red-800'
                    : report.status === 'resolved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground">Signal Strength:</span>
                  <span className="font-medium text-foreground">{report.signalStrength}%</span>
                </div>
                {report.location && (
                  <div className="flex justify-between">
                    <span className="text-foreground">Location:</span>
                    <span className="font-medium text-foreground">{report.location}</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <button className="w-full bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Support = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{role: string, content: string, timestamp: Date}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create a chat session when the component mounts
  useEffect(() => {
    const createChatSession = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/chat/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          throw new Error('Failed to create chat session');
        }

        const data = await response.json();
        setSessionId(data.sessionId);
        setMessages(data.messages);
        setError(null);
      } catch (error) {
        console.error('Error creating chat session:', error);
        setError('Failed to connect to support. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    createChatSession();
  }, []);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a message to the chatbot
  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    // Add user message to the UI immediately
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch(`/api/chat/session/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add assistant response to the UI
      setMessages(prev => [...prev, data.message]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message in the chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date()
      }]);
      setError('Failed to send message. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Request human support
  const requestHumanSupport = async () => {
    if (!sessionId || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/session/${sessionId}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to request human support');
      }

      // Add system message about human support
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Your request for human support has been received. A support agent will contact you soon.',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error requesting human support:', error);
      setError('Failed to request human support. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-foreground">Support</h1>
      <div className="bg-card p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <p className="text-foreground">Chat with our AI assistant</p>
          <button
            onClick={requestHumanSupport}
            className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded hover:bg-secondary/80"
            disabled={isLoading}
          >
            Request Human Support
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="border rounded-lg p-4 h-80 mb-4 overflow-y-auto bg-background">
          {messages.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Start a conversation with our AI assistant</p>
            </div>
          ) : (
            messages.map((message, index) => (
              message.role !== 'system' && (
                <div
                  key={index}
                  className={`${
                    message.role === 'assistant'
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground ml-auto'
                  } p-3 rounded-lg mb-2 max-w-[80%] ${message.role === 'user' ? 'ml-auto' : ''}`}
                >
                  <p>{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp instanceof Date
                      ? message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                      : new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              )
            ))
          )}
          {isLoading && (
            <div className="bg-muted text-foreground p-3 rounded-lg mb-2 max-w-[80%]">
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l-lg bg-background text-foreground"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="bg-primary text-primary-foreground p-2 rounded-r-lg hover:bg-primary/90 disabled:opacity-50"
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main layout with navigation
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setUser(userData.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card shadow">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-foreground">PrivacyShield</a>
          <nav>
            <ul className="flex space-x-4 items-center">
              <li><a href="/" className="text-foreground hover:text-primary">Home</a></li>
              <li><a href="/dashboard" className="text-foreground hover:text-primary">Dashboard</a></li>
              <li><a href="/reports" className="text-foreground hover:text-primary">Reports</a></li>
              <li><a href="/pricing" className="text-foreground hover:text-primary">Pricing</a></li>
              <li><a href="/support" className="text-foreground hover:text-primary">Support</a></li>

              {isAuthenticated ? (
                <li className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center text-foreground hover:text-primary focus:outline-none"
                  >
                    <span className="mr-1">{user?.name || 'User'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10">
                      <a href="/account" className="block px-4 py-2 text-sm text-foreground hover:bg-muted">Account Settings</a>
                      <a href="/dashboard" className="block px-4 py-2 text-sm text-foreground hover:bg-muted">Dashboard</a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              ) : (
                <>
                  <li><a href="/login" className="text-foreground hover:text-primary">Login</a></li>
                  <li><a href="/register" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">Sign Up</a></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-background">
        {children}
      </main>
      <footer className="bg-card p-6 text-center">
        <p className="text-foreground">© 2023 PrivacyShield. All rights reserved.</p>
      </footer>
    </div>
  );
};

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
      <LocalToastProvider>
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
      </LocalToastProvider>
    </ThemeProvider>
  );
}