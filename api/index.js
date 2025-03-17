// This is a simple API fallback for Vercel deployment
// In a production environment, you would connect this to your actual backend

export default function handler(req, res) {
  // Get the requested API endpoint
  const endpoint = req.url.replace(/^\/api\//, '');
  
  // Handle different API endpoints
  switch (endpoint) {
    case 'reports':
      if (req.method === 'GET') {
        // Return sample reports
        return res.status(200).json([
          {
            id: 1,
            frequency: 18000,
            description: 'Automatic report: V2K attack detected with signal strength of 75% in the high frequency range. Detection score: 12/18. Harmonic patterns detected. Modulation detected.',
            timestamp: new Date().toISOString()
          },
          {
            id: 2,
            frequency: 5000,
            description: 'Automatic report: SOUND-CANNON attack detected with signal strength of 82% in the mid-range frequency spectrum.',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          }
        ]);
      } else if (req.method === 'POST') {
        // Simulate creating a report
        return res.status(201).json({
          id: Math.floor(Math.random() * 1000),
          ...req.body,
          timestamp: new Date().toISOString()
        });
      }
      break;
      
    case 'subscription-plans':
      // Return subscription plans
      return res.status(200).json({
        plans: [
          {
            id: 1,
            name: 'Free',
            description: 'Basic protection for personal use',
            price: 0,
            interval: 'monthly',
            tier: 'free',
            features: [
              'Basic frequency monitoring',
              'Manual threat detection',
              'Limited reports history (7 days)',
              'Community support'
            ],
            active: true
          },
          {
            id: 2,
            name: 'Basic',
            description: 'Enhanced protection for individuals',
            price: 999,
            interval: 'monthly',
            tier: 'basic',
            features: [
              'Advanced frequency monitoring',
              'Automatic threat detection',
              'Extended reports history (30 days)',
              'Email alerts',
              'Basic countermeasures',
              'Email support'
            ],
            active: true
          },
          {
            id: 3,
            name: 'Premium',
            description: 'Professional protection for advanced users',
            price: 2999,
            interval: 'monthly',
            tier: 'premium',
            features: [
              'Professional frequency monitoring',
              'Real-time threat detection',
              'Unlimited reports history',
              'SMS & Email alerts',
              'Advanced countermeasures',
              'Frequency locking & tracking',
              'Priority email support',
              'Authorities notification'
            ],
            active: true
          },
          {
            id: 4,
            name: 'Enterprise',
            description: 'Complete protection for organizations',
            price: 9999,
            interval: 'monthly',
            tier: 'enterprise',
            features: [
              'Enterprise-grade frequency monitoring',
              'Real-time threat detection & analysis',
              'Unlimited reports history & analytics',
              'SMS, Email & Phone alerts',
              'Military-grade countermeasures',
              'Advanced frequency locking & tracking',
              'Dedicated support team',
              'Priority authorities notification',
              'Custom integration options',
              'Multiple user accounts'
            ],
            active: true
          }
        ]
      });
      
    case 'auth/me':
      // Return demo user or unauthorized
      if (Math.random() > 0.5) {
        return res.status(200).json({
          user: {
            id: 1,
            email: 'demo@example.com',
            name: 'Demo User',
            subscriptionTier: 'premium'
          }
        });
      } else {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
    case 'chat/session':
      if (req.method === 'POST') {
        // Create a new chat session
        return res.status(201).json({
          sessionId: `chat_${Date.now()}`,
          messages: [
            {
              role: 'assistant',
              content: 'Hello! I\'m the PrivacyShield Assistant. How can I help you today with privacy protection or threat detection?',
              timestamp: new Date().toISOString()
            }
          ]
        });
      }
      break;
      
    default:
      // Handle unknown endpoints
      return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  // Handle unsupported methods
  return res.status(405).json({ message: 'Method not allowed' });
}