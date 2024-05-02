import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import openai from './config/open-ai.js';
import session from 'express-session';
import questionsRouter from './routes/questions.js'

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
    cookie: { secure: false } 
}));


app.use(questionsRouter); // 라우터를 경로에 연결 <- qeustion 으로 오는 작업이 너무 길어 분리

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

// app.js
app.get('/chatbot/:id', (req, res) => {
    // ID 파싱
    const { id } = req.params;

    // HTML 파일 전송
    res.sendFile(path.join(__dirname, 'public/chatbot.html'));
});

app.get('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    const questions = req.session.results.questions;

    if (questions && questions.length > id) {
        const questionInfo = questions[id];
        console.log('질문 전송 체크'+ JSON.stringify(questionInfo, null, 2))
        res.json(questionInfo);
    } else {
        res.status(404).send("Question not found");
    }
});





// /tail_questions 경로에 대한 post 요청을 처리
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
