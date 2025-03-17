import { Router } from "express";
import { z } from "zod";
import { log } from "./vite";

// Message schema
const messageSchema = z.object({
  content: z.string().min(1).max(1000),
});

// Chat session storage
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  userId?: number;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  needsHumanSupport: boolean;
  supportRequestedAt?: Date;
  supportAssignedTo?: string;
}

class ChatbotService {
  private sessions: Map<string, ChatSession> = new Map();
  
  constructor() {
    log("Chatbot service initialized");
  }
  
  // Create a new chat session
  createSession(userId?: number): ChatSession {
    const sessionId = `chat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    
    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [
        {
          role: 'system',
          content: 'You are PrivacyShield Assistant, an AI designed to help users with privacy protection and threat detection. Be helpful, concise, and empathetic. If the user needs human support, acknowledge that and let them know you can connect them with a specialist.',
          timestamp: now
        },
        {
          role: 'assistant',
          content: 'Hello! I\'m the PrivacyShield Assistant. How can I help you today with privacy protection or threat detection?',
          timestamp: now
        }
      ],
      createdAt: now,
      updatedAt: now,
      needsHumanSupport: false
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }
  
  // Get a chat session
  getSession(sessionId: string): ChatSession | null {
    return this.sessions.get(sessionId) || null;
  }
  
  // Add a message to a session
  addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string): ChatMessage | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    const message: ChatMessage = {
      role,
      content,
      timestamp: new Date()
    };
    
    session.messages.push(message);
    session.updatedAt = new Date();
    
    return message;
  }
  
  // Process a user message and generate a response
  async processMessage(sessionId: string, content: string): Promise<ChatMessage | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Add user message
    this.addMessage(sessionId, 'user', content);
    
    // Check if the message indicates a need for human support
    const needsHumanSupport = this.checkForHumanSupportRequest(content, session.messages);
    
    let response: string;
    
    if (needsHumanSupport && !session.needsHumanSupport) {
      // Update session to indicate human support is needed
      session.needsHumanSupport = true;
      session.supportRequestedAt = new Date();
      
      response = "I understand you need assistance from a human specialist. I've flagged your conversation for our support team, and someone will be with you shortly. In the meantime, is there anything else I can help with?";
    } else if (session.needsHumanSupport) {
      response = "Your request for human support has been noted. A specialist will review your case as soon as possible. Is there any additional information you'd like to provide while waiting?";
    } else {
      // Generate AI response based on the conversation history
      response = await this.generateAIResponse(session.messages);
    }
    
    // Add assistant response
    return this.addMessage(sessionId, 'assistant', response);
  }
  
  // Check if a message indicates a need for human support
  private checkForHumanSupportRequest(message: string, history: ChatMessage[]): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Keywords that might indicate a need for human support
    const humanSupportKeywords = [
      'speak to a human',
      'talk to a person',
      'real person',
      'human agent',
      'human support',
      'customer service',
      'support agent',
      'speak with someone',
      'talk to someone',
      'emergency',
      'urgent help',
      'not helpful',
      'useless',
      'frustrated',
      'operator'
    ];
    
    // Check for direct requests for human support
    if (humanSupportKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return true;
    }
    
    // Check for repeated questions or frustration patterns
    if (history.length >= 6) {
      const userMessages = history.filter(msg => msg.role === 'user').map(msg => msg.content.toLowerCase());
      
      // Check for repeated similar questions (a sign of frustration)
      if (userMessages.length >= 3) {
        const lastThreeMessages = userMessages.slice(-3);
        const similarityCount = lastThreeMessages.filter(msg => 
          this.calculateSimilarity(msg, lowerMessage) > 0.7
        ).length;
        
        if (similarityCount >= 2) {
          return true;
        }
      }
      
      // Check for short, potentially frustrated responses
      const lastTwoUserMessages = userMessages.slice(-2);
      if (lastTwoUserMessages.every(msg => msg.length < 15 && /[!?]/.test(msg))) {
        return true;
      }
    }
    
    // Check for complex technical questions that the AI might not handle well
    const complexTopics = [
      'legal advice',
      'lawsuit',
      'court',
      'police report',
      'criminal',
      'evidence',
      'technical specification',
      'hardware modification',
      'custom installation'
    ];
    
    if (complexTopics.some(topic => lowerMessage.includes(topic))) {
      return true;
    }
    
    return false;
  }
  
  // Simple string similarity calculation (Jaccard index)
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');

    // Create sets without using spread operator
    const set1 = new Set<string>();
    const set2 = new Set<string>();

    // Populate sets
    words1.forEach(word => set1.add(word));
    words2.forEach(word => set2.add(word));

    // Calculate intersection size
    let intersectionSize = 0;
    set1.forEach(word => {
      if (set2.has(word)) {
        intersectionSize++;
      }
    });

    // Calculate union size (sum of sizes minus intersection)
    const unionSize = set1.size + set2.size - intersectionSize;

    return unionSize === 0 ? 0 : intersectionSize / unionSize;
  }
  
  // Generate an AI response based on the conversation history
  private async generateAIResponse(messages: ChatMessage[]): Promise<string> {
    // In a real implementation, this would call an LLM API like OpenAI
    // For now, we'll use a simple rule-based approach
    
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()?.content.toLowerCase() || '';
    
    // Check for greetings
    if (/^(hi|hello|hey|greetings)/.test(lastUserMessage)) {
      return "Hello! How can I assist you with PrivacyShield today?";
    }
    
    // Check for questions about the app
    if (lastUserMessage.includes('what is') || lastUserMessage.includes('how does') || lastUserMessage.includes('explain')) {
      if (lastUserMessage.includes('privacyshield')) {
        return "PrivacyShield is an advanced application designed to detect and protect against various privacy threats, including V2K (Voice-to-Skull), sound cannons, and non-lethal laser weapons. It uses sophisticated signal processing to identify potential threats and provides countermeasures to neutralize them.";
      }
      
      if (lastUserMessage.includes('v2k') || lastUserMessage.includes('voice to skull')) {
        return "Voice-to-Skull (V2K) technology refers to methods that can transmit sounds or voices directly into a person's head without conventional audio. PrivacyShield can detect the electromagnetic signatures of these devices and deploy countermeasures to protect you.";
      }
      
      if (lastUserMessage.includes('sound cannon') || lastUserMessage.includes('sonic weapon')) {
        return "Sound cannons, also known as Long Range Acoustic Devices (LRADs), are devices that can project sound over long distances at high intensity. PrivacyShield can detect their characteristic frequency patterns and alert you to their presence.";
      }
      
      if (lastUserMessage.includes('laser') || lastUserMessage.includes('directed energy')) {
        return "Non-lethal laser weapons can cause discomfort or temporary blindness. PrivacyShield can detect the electromagnetic signatures associated with these devices and provide alerts when they are detected.";
      }
      
      if (lastUserMessage.includes('subscription') || lastUserMessage.includes('plan') || lastUserMessage.includes('tier')) {
        return "PrivacyShield offers several subscription tiers: Free (basic protection), Basic ($9.99/month for enhanced protection), Premium ($29.99/month for professional protection), and Enterprise ($99.99/month for organizational protection). Each tier offers progressively more advanced features and protection capabilities.";
      }
      
      if (lastUserMessage.includes('countermeasure')) {
        return "PrivacyShield's countermeasures include phase-cancellation technology, multi-band noise generators, and frequency modulation techniques that can neutralize or disrupt external devices attempting to target you. The effectiveness of these countermeasures depends on your subscription tier.";
      }
    }
    
    // Check for help requests
    if (lastUserMessage.includes('help') || lastUserMessage.includes('support')) {
      return "I'm here to help! For technical issues, you can check our troubleshooting guide in the Help section. For account or billing questions, please visit the Account settings. If you're experiencing a threat, the app will automatically detect it and suggest appropriate actions. Would you like more specific assistance with something?";
    }
    
    // Check for subscription questions
    if (lastUserMessage.includes('upgrade') || lastUserMessage.includes('subscribe') || lastUserMessage.includes('payment')) {
      return "You can upgrade your subscription in the Account section. We offer several tiers with different features and protection levels. All payments are processed securely through Stripe. Would you like me to explain the different subscription tiers?";
    }
    
    // Default response for other queries
    return "Thank you for your question. PrivacyShield is designed to protect you from various privacy threats. To provide more specific assistance, could you please provide more details about what you're looking for?";
  }
  
  // Request human support for a session
  requestHumanSupport(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    session.needsHumanSupport = true;
    session.supportRequestedAt = new Date();
    
    // In a real implementation, this would notify support staff
    log(`Human support requested for chat session ${sessionId}`);
    
    return true;
  }
  
  // Assign a support agent to a session
  assignSupportAgent(sessionId: string, agentId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.needsHumanSupport) return false;
    
    session.supportAssignedTo = agentId;
    
    // Add a system message about the handover
    this.addMessage(sessionId, 'system', `Chat transferred to support agent ${agentId}`);
    
    log(`Support agent ${agentId} assigned to chat session ${sessionId}`);
    
    return true;
  }
  
  // Get all sessions that need human support
  getSessionsNeedingSupport(): ChatSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.needsHumanSupport && !session.supportAssignedTo)
      .sort((a, b) => a.supportRequestedAt!.getTime() - b.supportRequestedAt!.getTime());
  }
}

// Create a singleton instance
const chatbotService = new ChatbotService();

// Register routes
export function setupChatbot(app: Router) {
  // Create a new chat session
  app.post('/api/chat/session', (req, res) => {
    try {
      const userId = req.isAuthenticated() ? (req.user as any).id : undefined;
      const session = chatbotService.createSession(userId);
      
      res.status(201).json({
        sessionId: session.id,
        messages: session.messages
      });
    } catch (error) {
      console.error('Error creating chat session:', error);
      res.status(500).json({ message: 'Error creating chat session' });
    }
  });
  
  // Get a chat session
  app.get('/api/chat/session/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = chatbotService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: 'Chat session not found' });
      }
      
      res.json({
        sessionId: session.id,
        messages: session.messages,
        needsHumanSupport: session.needsHumanSupport
      });
    } catch (error) {
      console.error('Error retrieving chat session:', error);
      res.status(500).json({ message: 'Error retrieving chat session' });
    }
  });
  
  // Send a message to the chatbot
  app.post('/api/chat/session/:sessionId/message', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Validate request body
      const validatedData = messageSchema.parse(req.body);
      
      // Process the message
      const response = await chatbotService.processMessage(sessionId, validatedData.content);
      
      if (!response) {
        return res.status(404).json({ message: 'Chat session not found' });
      }
      
      const session = chatbotService.getSession(sessionId);
      
      res.json({
        message: response,
        needsHumanSupport: session?.needsHumanSupport || false
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      
      console.error('Error processing chat message:', error);
      res.status(500).json({ message: 'Error processing chat message' });
    }
  });
  
  // Request human support
  app.post('/api/chat/session/:sessionId/support', (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const success = chatbotService.requestHumanSupport(sessionId);
      
      if (!success) {
        return res.status(404).json({ message: 'Chat session not found' });
      }
      
      res.json({
        message: 'Human support requested successfully',
        needsHumanSupport: true
      });
    } catch (error) {
      console.error('Error requesting human support:', error);
      res.status(500).json({ message: 'Error requesting human support' });
    }
  });
  
  // Admin: Get sessions needing support
  app.get('/api/admin/chat/support-queue', (req, res) => {
    try {
      // In a real implementation, check if the user is an admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user is admin (simplified)
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const sessions = chatbotService.getSessionsNeedingSupport();
      
      res.json({ sessions });
    } catch (error) {
      console.error('Error retrieving support queue:', error);
      res.status(500).json({ message: 'Error retrieving support queue' });
    }
  });
  
  // Admin: Assign support agent
  app.post('/api/admin/chat/session/:sessionId/assign', (req, res) => {
    try {
      // In a real implementation, check if the user is an admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user is admin (simplified)
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { sessionId } = req.params;
      const { agentId } = req.body;
      
      if (!agentId) {
        return res.status(400).json({ message: 'Agent ID is required' });
      }
      
      const success = chatbotService.assignSupportAgent(sessionId, agentId);
      
      if (!success) {
        return res.status(404).json({ message: 'Chat session not found or does not need support' });
      }
      
      res.json({
        message: `Support agent ${agentId} assigned to session ${sessionId}`
      });
    } catch (error) {
      console.error('Error assigning support agent:', error);
      res.status(500).json({ message: 'Error assigning support agent' });
    }
  });
}