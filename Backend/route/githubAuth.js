const axios = require('axios');
const express = require('express');
const router = express.Router();
const cors = require('cors');

router.use(cors());

const clientId = 'Ov23li3e8KtYKNkwf2OB';
const clientSecret = '9ed09f817aca31aeab7523a35862dfadcb0c42d6';
const redirectUri = 'http://localhost:5000/api/githubauth/auth/github/callback';

router.get('/auth/github', async (req, res) => {
    try {
        const scope = 'user';
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
        res.json({ githubAuthUrl });
    } catch (error) {
        console.error('Error handling GitHub login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/auth/github/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            redirect_uri: redirectUri,
        }, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const accessToken = tokenResponse.data.access_token;
        const userDataResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`,
            },
        });

        const userData = userDataResponse.data;
        res.redirect(`http://localhost:3000?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    } catch (error) {
        console.error('Error handling GitHub callback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
