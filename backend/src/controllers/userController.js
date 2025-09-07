import User from '../models/user.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            email: user.email,
            username: user.name,
            preferences: user.preferences || {},
            notifications: user.notifications || {}
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        await User.findByIdAndUpdate(req.user.id, { name: username });
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePreferences = async (req, res) => {
    try {
        const { theme } = req.body;
        await User.findByIdAndUpdate(req.user.id, { 'preferences.theme': theme });
        res.json({ message: 'Preferences updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateNotifications = async (req, res) => {
    try {
        const { email, push } = req.body;
        await User.findByIdAndUpdate(req.user.id, {
            'notifications.email': email,
            'notifications.push': push
        });
        res.json({ message: 'Notifications updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
