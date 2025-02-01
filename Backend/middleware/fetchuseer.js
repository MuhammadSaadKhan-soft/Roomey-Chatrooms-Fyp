const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const fetchUser = async (req, res, next) => {
    console.log('Fetch user function called'); // Debug log

    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    console.log('Token from request:', token);

    if (!token) return res.status(401).json({ error: 'No token found' });

    if (token.startsWith('gho_')) {
        try {
            const githubUser = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${token}`,
                },
            });
            console.log('GitHub user:', githubUser.data);

            const emailResponse = await axios.get('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `token ${token}`,
                },
            });
            console.log('Email response:', emailResponse.data);

            const {  login, avatar_url, bio, name } = githubUser.data;
            const primaryEmail = emailResponse.data.find(email => email.primary)?.email || 'No email provided';

            const userName = name || login || 'No name provided';

            let user = await User.findOne({ email: primaryEmail });
            if (!user) {
                user = await User.create({
                    name: userName,
                    email: primaryEmail,
                    profilePicture: avatar_url || '',
                    bio: bio || `No bio provided By  User ${userName}`,
                    password: '', // Skipping password since it's not required for GitHub users
                    interest: ''|| `No interest provided By User ${userName}`, // Default empty string or appropriate default value
                });
                console.log('Created new user:', user);
            } else {
                // Update user details if they were missing
                user.name = user.name || userName;
                user.profilePicture = user.profilePicture || avatar_url || '';
                user.bio = user.bio || bio || `No bio provided By Github User ${userName}`;
                user.interest = user.interest || `No interest provided By Github User ${userName}`;
                await user.save();
                console.log('Updated user:', user);
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('GitHub token verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid GitHub token' });
        }
    } else {
        // Handle JWT
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('Decoded token:', decoded);

            req.user = await User.findById(decoded.userId);
            console.log('User from decoded token:', req.user);

            if (!req.user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (req.user.isAdmin) {
                req.isAdmin = true;
            }
            next();
        } catch (error) {
            console.error('JWT verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
};

module.exports = fetchUser;
