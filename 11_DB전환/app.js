import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import session from 'express-session';
import questionsRouter from './routes/questions.js';
import nodemailer from 'nodemailer';
import dbRouter from './routes/dbconn.js'
import sideChatList from'./routes/sideChatList.js'
import mysql from "mysql2";
import dbconfig from "./config/dbconfig.json" assert { type: "json" };

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const pool = mysql.createPool({
    connectionLimit: 100,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false,
  });

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
app.use(questionsRouter); 
app.use(dbRouter)
app.use(sideChatList)

// /join 경로에 대한 GET 요청을 처리
app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/join.html'));
});




// app.js 파일
// app.get('/chatbot/:id', (req, res) => {
//     // ID 파싱
//     const { id } = req.params;

//     // 세션에서 질문 배열을 가져옴
//     const questions = req.session.results.questions;
//     //console.log('질문 전달 확인:', JSON.stringify(questions, null, 2))
//     const questionInfo = questions[id];
    
//     // 세션 데이터와 비교
//     if (questions && questions.length > id) {
//         const questionInfo = questions[id]; // 배열 인덱스로 접근
//         console.log('질문 전달 확인:', JSON.stringify(questionInfo, null, 2))
//         // 저장된 세부 질문 정보를 사용자에게 전달하기 위해 미리 준비된 HTML 파일을 수정하는 방법을 제안합니다.
//         // HTML 파일에 직접 데이터를 주입할 수 없으므로, 클라이언트 사이드에서 JavaScript를 사용하여 데이터를 처리해야 합니다.
//         // res.json(questionInfo);
//         return;
//         //res.sendFile(path.join(__dirname, 'public/chatbot.html'));
//     } else {
//         res.status(404).send("Question not found");
//         return;
//     }
// });

// 챗봇 화면
app.get('/chatbot/:id', (req, res) => {
    // ID 파싱
    const { id } = req.params;

    // HTML 파일 전송
    res.sendFile(path.join(__dirname, 'public/chatbot.html'));
});

app.get('/dtail_page/:chat_list_id', (req, res)=>{
    const {chat_list_id} = req.params;

    res.sendFile(path.join(__dirname, 'public/dtail_questions.html'))
})

app.get("/dtail_other/:question_id", (req, res) => {
    const {question_id} = req.params;
    res.sendFile(path.join(__dirname, 'public/dtail_other.html'))
});



// 꼬리질문 형태
app.get('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    if (req.session.results && req.session.results.questions) {
        const questions = req.session.results.questions;
        const questionIndex = parseInt(id, 10);

        if (!isNaN(questionIndex) && questionIndex < questions.length) {
            const questionInfo = questions[questionIndex];
            res.json({ success: true, question: questionInfo });
        } else {
            res.status(404).json({ success: false, message: "Question not found" });
        }
    } else {
        pool.getConnection((err, conn) => {
            if (err) {
                console.error("Mysql getConnection error: " + err);
                res.status(500).json({ success: false, message: "Database connection failed" });
                return;
            }
            conn.query('SELECT * FROM initial_questions WHERE question_id = ?;', [id], (err, rows) => {
                conn.release();
                if (err) {
                    console.error('SQL Error:', err);
                    res.status(500).json({ success: false, message: "SQL Error" });
                    return;
                }
                if (rows.length > 0) {
                    res.json({ success: true, question: rows[0] });
                } else {
                    res.status(404).json({ success: false, message: "Question not found" });
                }
            });
        });
    }
});


app.get('/tail_questions', (req, res) => {
    
    if (req.session.status === 'ready' && req.session.results) {
        res.sendFile(path.join(__dirname, 'public/tail_questions.html'));
    } else {
        res.redirect('/staychatbot_processing');
    }
});
// app.get('/tail_questions', (req, res) => {
//     if (req.session.status === 'ready' && req.session.results) {
//         res.render('tail_questions', {
//             questions: req.session.results.questions // 결과가 이런 구조로 되어 있다고 가정
//         });
//     } else {
//         res.redirect('/staychatbot_processing');
//     }
// });

// 결과 상태 확인
app.get('/check_results', (req, res) => {
    if (req.session.status === 'ready' || req.session.results) {
        res.json({ status: 'ready', data: req.session.results });
    } else if (req.session.status === 'error') {
        res.json({ status: 'error', message: 'Processing failed' });
    } else {
        res.json({ status: 'processing' });
    }
});





// 애니메이션 페이지를 보여줄 창
app.get('/staychatbot_processing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/staychatbot.html'));
});




// /one_magnetic 경로에 대한 get 요청을 처리
app.get('/one_magnetic', (req, res) => {
 
    res.sendFile(path.join(__dirname, 'public/one_magnetic.html'));
});


// 로그아웃
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ message: '로그아웃 실패.' });
        }
        
        res.send({ redirectTo: '/join' });
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
