import bcrypt from 'bcryptjs';
import { storage } from '../server/storage';

async function createAdminUser() {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail('keo.boss48@gmail.com');
    
    if (existingUser) {
      console.log('User already exists. Updating to enterprise tier...');
      
      // Update the user to enterprise tier
      const updatedUser = await storage.updateUser(existingUser.id, {
        subscriptionTier: 'enterprise'
      });
      
      console.log('User updated successfully:', {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        subscriptionTier: updatedUser.subscriptionTier
      });
      
      return;
    }
    
    // Create a secure password
    const password = 'Admin@123456'; // You should change this after creation
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create the admin user with enterprise subscription
    const user = await storage.createUser({
      email: 'keo.boss48@gmail.com',
      passwordHash,
      name: 'Admin User',
      subscriptionTier: 'enterprise',
      createdAt: new Date()
    });
    
    console.log('Admin user created successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier
    });
    
    console.log('\nLogin credentials:');
    console.log('Email: keo.boss48@gmail.com');
    console.log('Password: Admin@123456');
    console.log('\nIMPORTANT: Please change this password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Execute the function
createAdminUser();