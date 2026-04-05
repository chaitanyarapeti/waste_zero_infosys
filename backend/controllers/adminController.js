const User = require('../models/user');
const Pickups = require('../models/Pickups');
const Opportunity = require('../models/opportunity');
const Application = require('../models/Application');

// Get admin stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const completedPickups = await Pickups.countDocuments({ status: 'Completed' });
    const pendingPickups = await Pickups.countDocuments({ status: 'Scheduled' });
    const activeOpportunities = await Opportunity.countDocuments({ status: 'Open' });

    res.json({
      totalUsers,
      completedPickups,
      pendingPickups,
      activeOpportunities
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Suspend user
const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'suspended' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log admin action
    console.log(`Admin ${req.user.id} suspended user ${userId}`);

    res.json({ message: 'User suspended successfully', user });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ message: 'Error suspending user', error: error.message });
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'active' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log admin action
    console.log(`Admin ${req.user.id} activated user ${userId}`);

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ message: 'Error activating user', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Delete user's pickups
    await Pickups.deleteMany({ user_id: userId });
    
    // Delete user's opportunities
    await Opportunity.deleteMany({ posted_by: userId });
    
    // Delete user's applications
    await Application.deleteMany({ volunteer_id: userId });
    
    // Delete user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log admin action
    console.log(`Admin ${req.user.id} deleted user ${userId}`);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get admin logs
const getAdminLogs = async (req, res) => {
  try {
    // For now, return empty array - you can implement a proper logging system
    // You might want to create an AdminLog model to store admin actions
    res.json([]);
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};

// Delete pickup (admin)
const deletePickup = async (req, res) => {
  try {
    const { pickupId } = req.params;
    
    const pickup = await Pickups.findByIdAndDelete(pickupId);

    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }

    // Log admin action
    console.log(`Admin ${req.user.id} deleted pickup ${pickupId}`);

    res.json({ message: 'Pickup deleted successfully' });
  } catch (error) {
    console.error('Error deleting pickup:', error);
    res.status(500).json({ message: 'Error deleting pickup', error: error.message });
  }
};

// Delete opportunity (admin)
const deleteOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    
    // Delete associated applications
    await Application.deleteMany({ opportunity_id: opportunityId });
    
    // Delete opportunity
    const opportunity = await Opportunity.findByIdAndDelete(opportunityId);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Log admin action
    console.log(`Admin ${req.user.id} deleted opportunity ${opportunityId}`);

    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ message: 'Error deleting opportunity', error: error.message });
  }
};

// Generate CSV reports
const generateReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    let data = [];
    let headers = [];

    switch (reportType) {
      case 'users':
        const users = await User.find().select('-password');
        headers = ['Name', 'Email', 'Role', 'Status', 'Joined Date'];
        data = users.map(user => [
          user.name,
          user.email,
          user.role,
          user.status || 'active',
          new Date(user.createdAt).toLocaleDateString()
        ]);
        break;

      case 'pickups':
        const pickups = await Pickups.find().populate('user_id', 'name email');
        headers = ['User', 'Email', 'Address', 'Waste Type', 'Quantity', 'Status', 'Date'];
        data = pickups.map(pickup => [
          pickup.user_id?.name || 'N/A',
          pickup.user_id?.email || 'N/A',
          pickup.address,
          pickup.waste_type,
          pickup.quantity_kg,
          pickup.status,
          new Date(pickup.scheduled_date).toLocaleDateString()
        ]);
        break;

      case 'opportunities':
        const opportunities = await Opportunity.find().populate('posted_by', 'name email');
        headers = ['Title', 'Posted By', 'Location', 'Type', 'Status', 'Date', 'Volunteers Needed'];
        data = opportunities.map(opp => [
          opp.title,
          opp.posted_by?.name || 'N/A',
          opp.location,
          opp.type,
          opp.status,
          new Date(opp.date).toLocaleDateString(),
          opp.volunteers_needed
        ]);
        break;

      case 'activity':
        // Combine all data
        const allUsers = await User.find().select('-password');
        const allPickups = await Pickups.find().populate('user_id', 'name email');
        const allOpportunities = await Opportunity.find().populate('posted_by', 'name email');
        const applications = await Application.find()
          .populate('volunteer_id', 'name email')
          .populate('opportunity_id', 'title');

        headers = ['Type', 'User', 'Description', 'Status', 'Date'];
        
        // Add user registrations
        allUsers.forEach(user => {
          data.push([
            'User Registration',
            user.name,
            `${user.role} registered`,
            user.status || 'active',
            new Date(user.createdAt).toLocaleDateString()
          ]);
        });

        // Add pickups
        allPickups.forEach(pickup => {
          data.push([
            'Pickup',
            pickup.user_id?.name || 'N/A',
            `${pickup.waste_type} - ${pickup.quantity_kg}kg`,
            pickup.status,
            new Date(pickup.scheduled_date).toLocaleDateString()
          ]);
        });

        // Add opportunities
        allOpportunities.forEach(opp => {
          data.push([
            'Opportunity',
            opp.posted_by?.name || 'N/A',
            opp.title,
            opp.status,
            new Date(opp.date).toLocaleDateString()
          ]);
        });

        // Add applications
        applications.forEach(app => {
          data.push([
            'Volunteer Application',
            app.volunteer_id?.name || 'N/A',
            `Applied to: ${app.opportunity_id?.title || 'N/A'}`,
            app.status,
            new Date(app.applied_at).toLocaleDateString()
          ]);
        });
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Generate CSV
    const csv = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  suspendUser,
  activateUser,
  deleteUser,
  deletePickup,
  deleteOpportunity,
  getAdminLogs,
  generateReport
};
