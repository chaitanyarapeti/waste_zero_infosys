const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/user');

async function createAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@wastezero.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists. Updating password...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ Admin password updated!');
    } else {
      console.log('👤 Creating new admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = new User({
        name: 'Admin User',
        email: 'admin@wastezero.com',
        password: hashedPassword,
        role: 'admin',
        location: 'Jaipur, Rajasthan',
        bio: 'System Administrator',
        status: 'active'
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@wastezero.com');
    console.log('   Password: admin123');
    console.log('\n🎉 You can now login with these credentials!');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
