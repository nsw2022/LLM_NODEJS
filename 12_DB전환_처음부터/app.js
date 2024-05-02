import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import session from 'express-session';
//import questionsRouter from './routes/questions.js';
import nodemailer from 'nodemailer';
//import dbRouter from './routes/dbconn.js'


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


// bodyParser는 JSON 데이터를 처리하기 위해 사용됩니다.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// public 폴더 설정을 통해 정적 파일을 자동으로 제공
app.use(express.static(path.join(__dirname, 'public')));
// 세션정의
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false , maxAge:3_600_000 } //1시간 
}));

// 라우터를 경로에 연결 
// app.use(questionsRouter); 
// app.use(dbRouter)

// /join 경로에 대한 GET 요청을 처리
app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/join.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

