const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/user');
const Pickups = require('./models/Pickups');
const Opportunity = require('./models/opportunity');
const Application = require('./models/Application');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@wastezero.com',
    password: '$2b$10$YourHashedPasswordHere', // In production, use bcrypt
    role: 'admin',
    location: 'Jaipur, Rajasthan',
    bio: 'System Administrator',
    status: 'active'
  },
  {
    name: 'John Volunteer',
    email: 'john@example.com',
    password: '$2b$10$YourHashedPasswordHere',
    role: 'volunteer',
    skills: 'Sorting, Transportation',
    location: 'Delhi, India',
    bio: 'Passionate about environmental conservation',
    status: 'active'
  },
  {
    name: 'Sarah Green',
    email: 'sarah@example.com',
    password: '$2b$10$YourHashedPasswordHere',
    role: 'volunteer',
    skills: 'Community Outreach',
    location: 'Mumbai, India',
    bio: 'Environmental activist',
    status: 'active'
  },
  {
    name: 'Green NGO',
    email: 'contact@greenngo.org',
    password: '$2b$10$YourHashedPasswordHere',
    role: 'NGO',
    location: 'Bangalore, India',
    bio: 'Working towards a cleaner future',
    status: 'active'
  },
  {
    name: 'Eco Warriors',
    email: 'info@ecowarriors.org',
    password: '$2b$10$YourHashedPasswordHere',
    role: 'NGO',
    location: 'Chennai, India',
    bio: 'Community-driven waste management',
    status: 'active'
  },
  {
    name: 'Mike Donor',
    email: 'mike@example.com',
    password: '$2b$10$YourHashedPasswordHere',
    role: 'donor',
    location: 'Pune, India',
    bio: 'Supporting green initiatives',
    status: 'active'
  },
  {
    name: 'Suspended User',
    email: 'suspended@example.com',
    password: '$2b$10$YourHashedPasswordHere',
    role: 'volunteer',
    location: 'Kolkata, India',
    bio: 'This account is suspended',
    status: 'suspended'
  }
];

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Pickups.deleteMany({});
    await Opportunity.deleteMany({});
    await Application.deleteMany({});
    console.log('✅ Existing data cleared');

    // Insert users
    console.log('👥 Creating users...');
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${users.length} users`);

    // Get user IDs for relationships
    const volunteerUser = users.find(u => u.email === 'john@example.com');
    const ngoUser = users.find(u => u.role === 'NGO');
    const donorUser = users.find(u => u.role === 'donor');

    // Create pickups
    console.log('📦 Creating pickups...');
    const samplePickups = [
      {
        user_id: volunteerUser._id,
        address: '123 Green Street',
        city: 'Delhi',
        pickup_date: new Date('2024-11-15'),
        time_slot: 'morning',
        scheduled_time: new Date('2024-11-15T09:00:00'),
        waste_types: ['Plastic', 'Paper'],
        status: 'Completed',
        additional_notes: 'Plastic bottles and containers'
      },
      {
        user_id: volunteerUser._id,
        address: '456 Eco Lane',
        city: 'Delhi',
        pickup_date: new Date('2024-11-20'),
        time_slot: 'afternoon',
        scheduled_time: new Date('2024-11-20T14:00:00'),
        waste_types: ['Paper', 'Cardboard'],
        status: 'Completed',
        additional_notes: 'Newspapers and cardboard boxes'
      },
      {
        user_id: donorUser._id,
        address: '789 Clean Road',
        city: 'Pune',
        pickup_date: new Date('2024-11-25'),
        time_slot: 'morning',
        scheduled_time: new Date('2024-11-25T10:00:00'),
        waste_types: ['E-Waste'],
        status: 'Scheduled',
        additional_notes: 'Old electronics and gadgets'
      },
      {
        user_id: volunteerUser._id,
        address: '321 Recycle Blvd',
        city: 'Delhi',
        pickup_date: new Date('2024-11-18'),
        time_slot: 'evening',
        scheduled_time: new Date('2024-11-18T17:00:00'),
        waste_types: ['Organic'],
        status: 'Completed',
        additional_notes: 'Food waste for composting'
      },
      {
        user_id: donorUser._id,
        address: '555 Sustainability Ave',
        city: 'Pune',
        pickup_date: new Date('2024-11-28'),
        time_slot: 'afternoon',
        scheduled_time: new Date('2024-11-28T15:00:00'),
        waste_types: ['Glass', 'Metal'],
        status: 'Scheduled',
        additional_notes: 'Glass bottles and metal cans'
      },
      {
        user_id: volunteerUser._id,
        address: '777 Green Haven',
        city: 'Mumbai',
        pickup_date: new Date('2024-11-22'),
        time_slot: 'morning',
        scheduled_time: new Date('2024-11-22T08:00:00'),
        waste_types: ['Plastic', 'Glass'],
        status: 'In Transit',
        additional_notes: 'Mixed recyclables'
      }
    ];
    
    const pickups = await Pickups.insertMany(samplePickups);
    console.log(`✅ Created ${pickups.length} pickups`);

    // Create opportunities
    console.log('🌍 Creating opportunities...');
    const sampleOpportunities = [
      {
        title: 'Beach Cleanup Drive',
        description: 'Join us for a massive beach cleanup initiative at Marina Beach',
        ngo_id: ngoUser._id,
        date: '2024-12-01',
        duration: '4 hours',
        required_skills: ['Physical fitness', 'Team work'],
        location: {
          type: 'Point',
          coordinates: [80.2785, 13.0478], // Marina Beach, Chennai [lng, lat]
          address: 'Marina Beach, Chennai'
        },
        status: 'Open'
      },
      {
        title: 'Recycling Workshop',
        description: 'Learn about proper recycling techniques and waste segregation',
        ngo_id: ngoUser._id,
        date: '2024-12-05',
        duration: '3 hours',
        required_skills: ['Communication', 'Teaching'],
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760], // Mumbai [lng, lat]
          address: 'Community Center, Mumbai'
        },
        status: 'Open'
      },
      {
        title: 'Tree Plantation Drive',
        description: 'Help us plant 1000 trees in urban areas',
        ngo_id: ngoUser._id,
        date: '2024-12-10',
        duration: '5 hours',
        required_skills: ['Physical fitness', 'Gardening'],
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716], // Bangalore [lng, lat]
          address: 'City Park, Bangalore'
        },
        status: 'Open'
      },
      {
        title: 'E-Waste Collection Camp',
        description: 'Bring your old electronics for proper recycling',
        ngo_id: ngoUser._id,
        date: '2024-11-30',
        duration: '6 hours',
        required_skills: ['Organization', 'Documentation'],
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716], // Bangalore [lng, lat]
          address: 'Tech Hub, Bangalore'
        },
        status: 'Open'
      },
      {
        title: 'School Awareness Program',
        description: 'Teach students about waste management and sustainability',
        ngo_id: ngoUser._id,
        date: '2024-11-28',
        duration: '2 hours',
        required_skills: ['Communication', 'Teaching', 'Public speaking'],
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041], // Delhi [lng, lat]
          address: 'Green Valley School, Delhi'
        },
        status: 'Closed'
      }
    ];

    const opportunities = await Opportunity.insertMany(sampleOpportunities);
    console.log(`✅ Created ${opportunities.length} opportunities`);

    // Create applications
    console.log('📝 Creating volunteer applications...');
    const sampleApplications = [
      {
        opportunity_id: opportunities[0]._id,
        volunteer_id: volunteerUser._id,
        status: 'Accepted'
      },
      {
        opportunity_id: opportunities[1]._id,
        volunteer_id: volunteerUser._id,
        status: 'Pending'
      },
      {
        opportunity_id: opportunities[2]._id,
        volunteer_id: ngoUser._id,
        status: 'Pending'
      },
      {
        opportunity_id: opportunities[3]._id,
        volunteer_id: volunteerUser._id,
        status: 'Rejected'
      }
    ];

    const applications = await Application.insertMany(sampleApplications);
    console.log(`✅ Created ${applications.length} applications`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Pickups: ${pickups.length}`);
    console.log(`   - Opportunities: ${opportunities.length}`);
    console.log(`   - Applications: ${applications.length}`);
    console.log('\n✅ You can now test the admin panel at http://localhost:3000/admin');
    console.log('\n📋 Test Credentials:');
    console.log('   Email: admin@wastezero.com');
    console.log('   Password: password123 (use this for login if implemented)\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
