require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // QUAN TRỌNG: Phải có dòng này

const app = express();
app.use(cors());
const PORT = 3000;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const CHANNEL_ID = '1488871990508130354';

app.get('/api/tiktoks', async (req, res) => {
    try {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (!channel) return res.status(404).json({ error: 'Không tìm thấy kênh' });

        const messages = await channel.messages.fetch({ limit: 10 });
        const tiktokRegex = /https:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/g;
        
        const videoData = []; // Khai báo mảng chứa kết quả

        for (const msg of messages.values()) {
            const matches = msg.content.match(tiktokRegex);
            if (matches) {
                for (const link of matches) {
                    try {
                        // Gọi API lấy mã nhúng từ TikTok
                        const response = await axios.get(`https://www.tiktok.com/oembed?url=${link}`);
                        videoData.push({
                            url: link,
                            author: response.data.author_name,
                            html: response.data.html
                        });
                    } catch (e) {
                        console.log("Link lỗi hoặc bị chặn:", link);
                    }
                }
            }
        }
        // Trả về đúng tên thuộc tính 'videos'
        res.json({ videos: videoData });

    } catch (error) {
        console.error("Lỗi Server:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Thêm cái này để tránh sập server khi gặp lỗi kết nối Discord
process.on('unhandledRejection', error => {
    console.error('Lỗi chưa xử lý:', error);
});

client.login(process.env.DISCORD_TOKEN); // Nhớ dùng Token mới đã reset!

app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
});