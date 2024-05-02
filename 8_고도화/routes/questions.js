import express from 'express';
import { processIntroduction, storeResultsSomehow } from '../services/questionService.js'; // 가정된 서비스 파일

import openai from '../config/open-ai.js'; // openai 설정 가져오기

const router = express.Router();

// /staychatbot 경로에 대한 poast 요청을 처리
/* 
    TODO: 수정해야할것 현재는 임의로 내가 넣었지만 index부터 선택한 것으로 프롬프트를 바꿔야함 내용도 합의 해서 바꿔야할듯함
    원본은 4_에 저장되어있음 현재는 임의로 수정
*/
router.post('/staychatbot', async (req, res) => {
    const {introduction} = req.body
    console.log(introduction);

    // 백그라운드에서 계속 처리
    try {
        // 다음 페이지에서 액세스할 수 있는 곳에 결과를 저장한다고 가정합니다.
        
    

        const results = await processIntroduction(introduction);  // 처리를 처리하는 비동기 함수여야 합니다.
        console.log('세션 확인 이벤트 체그')
        
        req.session.results = results; // 결과 저장
        console.log('결과 확인'+req.session.results)
        req.session.status = 'ready'; // 상태를 'ready'로 설정
        console.log('결과 객체:', JSON.stringify(req.session.results, null, 2));//여기서 null과 2는 JSON 문자열의 포맷을 보기 좋게 들여쓰기하기 위해 사용됩니다.
        storeResultsSomehow(req, results);  // 이렇게 하면 결과를 임시로 저장할 수 있습니다.
        res.redirect('/staychatbot_processing');  //애니메이션 페이지를 제공하는 경로로 이동 하지만 redirect라 이동을 하면 세션이 따라오진 않음
        
    } catch (error) {
        console.error("OpenAI API error:", error);
        // Handle errors appropriately
    }
    
})
//     // 처리 시작 응답
//     // UI 반응성을 유지하기 위해 즉시 리디렉션
    
    
// });
// questions.js
// router.post('/staychatbot', async (req, res) => {
//     const { introduction } = req.body;
//     try {
//         // 비동기 작업 처리
//         const results = await processIntroduction(introduction);
//         req.session.results = results;
//         req.session.save(() => {
//             res.redirect('/staychatbot_processing');
//         });
//     } catch (error) {
//         console.error("Error processing introduction:", error);
//         res.status(500).send("Error processing the request");
//     }
// });





router.post('/staychatbot', async (req, res) => {
    const { introduction } = req.body;
    console.log(introduction);

    try {
        const results = await processIntroduction(introduction);
        req.session.results = results;
        req.session.status = 'ready';
        res.json({ redirect: '/staychatbot_processing' });  // 클라이언트에 리다이렉트 명령 전달
    } catch (error) {
        console.error("Error processing introduction:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});




/*
    질문: ${질문}
        답변: ${답변}
        이 답변을 기반으로 추가 질문과 팁을 생성합니다. 추가 질문은 답변을 더 깊이 파고들어 더 자세한 내용을 묻습니다. 다음 스키마를 사용하여 JSON 형식으로 답변을 제공하세요:
        {
            {"질문": "...", "tip": "..."}    
        }
        지침:
        - 형식: JSON
        - 난이도: 고급
        - 질문 수 1
        - 대상 지원자
        - 질문의 목적: 지원자의 자격 및 적합성 평가
        - 참고: '팁'은 지원자가 질문에 가장 잘 답할 수 있는 방법을 안내해야 합니다.
        - 사용 언어: 사용 언어: 영어

        한국어로 답변해 주세요.
    Question: ${question}
        Answer: ${answer}
        Generate additional questions and tips based on this answer. Additional questions will dig deeper into the answer and ask for more details. Please provide your response in JSON format with the following schema:
        {
            {"question": "...", "tip": "..."}    
        }
        Instructions:
        - Format: JSON
        - Difficulty level: Advanced
        - Number of questions: 1
        - Audience: Applicants
        - Purpose of questions: To assess applicant qualifications and fit
        - Note: The 'tip' should guide the applicant on how best to answer the question.
        - Language used: English

        Please respond in Korean.
*/
router.post('/submit-answer', async (req, res) => {
    const { question, answer } = req.body;
    console.log('꼬질 질문 이벤트 체크')
    // 질문과 답변을 바탕으로 추가 질문과 팁을 생성하는 프롬프트 구성
    const prompt_content = `
        질문: ${question}
        답변: ${answer}
        이 답변을 기반으로 추가 질문과 팁을 생성합니다. 추가 질문은 답변을 더 깊이 파고들어 더 자세한 내용을 묻습니다. 다음 스키마를 사용하여 JSON 형식으로 답변을 제공하세요:
        {
            {"질문": "...", "tip": "..."}    
        }
        지침:
        - 형식: JSON
        - 난이도: 고급
        - 질문 수 1
        - 대상 지원자
        - 질문의 목적: 지원자의 자격 및 적합성 평가
        - 참고: '팁'은 지원자가 질문에 가장 잘 답할 수 있는 방법을 안내해야 합니다.
        - 사용 언어: 사용 언어: 영어
        
        한국어로 답변해 주세요.
    `;

    // 메시지 객체 구성을 수정
    const messages = [
        {"role": "system", "content": "You are a helpful interview question generator that provides follow-up questions and tips based on the applicant's answer."},
        {"role": "user", "content": prompt_content}
    ];

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // 모델 선택
            messages: messages, // 수정된 메시지 객체 사용
            temperature: 0.5, // 온도 설정으로 창의성 조절
        });

        // 응답 파싱 및 JSON 포맷으로 클라이언트에 전송
        // 응답에서 추가 질문과 팁만 추출하기 위해 처리 로직 추가
        const content = response.choices[0].message.content;
        //console.log(typeof content)
        console.log(content)
        
        const data = JSON.parse(content); // JSON 파싱
        console.log('꼬질 전송 체크' + JSON.stringify(data, null, 2))
        res.json({ data });
    } catch (error) {
        console.error("Error processing answer:", error);
        res.status(500).json({ error: "Error processing answer" });
    }
});

// 세션 질문 받는 경로
router.get('/get_questions', (req, res) => {
    if (req.session.results) {
        res.json({ questions: req.session.results.questions });  // JSON 형식으로 질문 데이터 응답
        return;
        //console.log('세션 전달 확인:', JSON.stringify(res.json({ questions: req.session.results.questions }), null, 2))
    } else {
        res.status(404).send({ message: "No questions available" });  // 데이터가 없는 경우 404 응답
    }
});

export default router;