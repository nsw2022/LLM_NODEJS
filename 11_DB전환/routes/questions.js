import express from "express";
import mysql from "mysql2";
import dbconfig from "../config/dbconfig.json" assert { type: "json" };
import {
  processIntroduction,
  storeResultsSomehow,
  summaryIntroduction,
} from "../services/questionService.js"; // 가정된 서비스 파일

import openai from "../config/open-ai.js"; // openai 설정 가져오기

const router = express.Router();


const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbconfig.host,
  user: dbconfig.user,
  password: dbconfig.password,
  database: dbconfig.database,
  debug: false,
});

// /staychatbot 경로에 대한 poast 요청을 처리
/* 
    TODO: 수정해야할것 현재는 임의로 내가 넣었지만 index부터 선택한 것으로 프롬프트를 바꿔야함 내용도 합의 해서 바꿔야할듯함
    원본은 4_에 저장되어있음 현재는 임의로 수정
*/
router.post("/staychatbot", async (req, res) => {
  const { introduction } = req.body;
  console.log(introduction);

  try {
    const results = await processIntroduction(introduction);
    const summary = await summaryIntroduction(introduction);
    req.session.results = results;
    req.session.results.summary = summary;
    req.session.status = "ready";

    // 데이터베이스 연결 및 쿼리 실행
    pool.getConnection(async (err, conn) => {
      if (err) {
        console.error("Mysql getConnection error: ", err);
        res.status(500).send({ success: false, message: "Database connection failed" });
        if (conn) conn.release();
        return;
      }

      try {
        // 첫 번째 쿼리: 채팅 리스트에 새로운 항목을 추가
        const chatListInsert = await conn.promise().query(
          "INSERT INTO chat (user_login_id, introduction, chat_summary) VALUES (?, ?, ?);",
          [req.session.user.id, introduction, summary]
        );
        console.log("Inserted 채팅 리스트 성공", chatListInsert[0]);

        let questionCode = 0; 

        // 추가 쿼리: 생성된 질문들을 데이터베이스에 저장
        if (results.questions) {
          for (const question of results.questions) {
            await conn.promise().query(
              "INSERT INTO initial_questions (chat_id, question_code, question_text, question_tip) VALUES (?, ?, ?, ?);",
              [chatListInsert[0].insertId, questionCode, question.question, question.tip]
            );
            //console.log("Inserted 질문 성공");
            questionCode = (questionCode + 1) % 6;
          }
        }

        conn.release();  // 연결 해제
        res.redirect("/staychatbot_processing");  // 결과 페이지로 리디렉트
      } catch (sqlErr) {
        console.error("SQL 실행 시 오류 발생:", sqlErr);
        conn.release();  // 에러 시 연결 해제
        res.status(500).send({ error: "Error executing SQL queries" });
      }
    });
  } catch (error) {
    console.error("Error processing introduction:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

/*
router.post("/staychatbot", async (req, res) => {
  const { introduction } = req.body;
  console.log(introduction);

  try {
      // 질문 생성
      const results = await processIntroduction(introduction);
      
      if (results.questions && results.questions.length > 0) {
          // 데이터베이스에 질문 저장
          pool.getConnection(async (err, conn) => {
              if (err) {
                  console.error("Mysql getConnection error: ", err);
                  res.status(500).send({ success: false, message: "Database connection failed" });
                  return;
              }
              try {
                  // 질문을 하나씩 데이터베이스에 저장
                  for (const question of results.questions) {
                      const { question_text, tip } = question;  // 가정된 구조
                      await conn.promise().query(
                          "INSERT INTO question (chat_list_id, questions, question_tip) VALUES (?, ?, ?)",
                          [chatListId, question_text, tip]
                      );
                  }
                  conn.release();
                  res.send({ success: true, message: "Questions saved successfully!" });
              } catch (queryError) {
                  conn.release();
                  console.error("Error inserting questions:", queryError);
                  res.status(500).send({ success: false, message: "Failed to insert questions." });
              }
          });
      } else {
          res.status(404).send({ success: false, message: "No questions generated from OpenAI." });
      }
  } catch (processError) {
      console.error("Error processing introduction:", processError);
      res.status(500).send({ error: "Internal Server Error" });
  }
});


router.post("/staychatbot", async (req, res) => {
  const { introduction } = req.body;
  console.log(introduction);

  try {
    const results = await processIntroduction(introduction);

    const summary = await summaryIntroduction(introduction);
    req.session.results = results;
    req.session.results.summary = summary;
    req.session.status = "ready";

    // introduction
    pool.getConnection((err, conn) => {
      if (err) {
        if (conn) conn.release();
        console.error("Mysql getConnection error: ", err);
        res
          .status(500)
          .send({ success: false, message: "Database connection failed" });
        return;
      }
      console.log("데이터베이스 연결 잘됨");
      const exec = conn.query(
        "insert into chat_list (user_id, introduction, summary_chat)  values (?,?,? );",
        [req.session.user.id, introduction, summary],
        (err, result) => {
          conn.release();
          console.log("실행된 SQL: " + exec.sql);
          if (err) {
            console.log("SQL 실행 시 오류 발생.");
            console.dir(err);
            return;
          }
  
          if (result) {
            console.dir(result);
            console.log("Inserted 성공");
           
          } else {
            console.dir(result);
            console.log("Inserted 실패");
          }
        }
      );
    });

    // 클라이언트를 결과 확인 페이지로 리디렉트
    res.redirect("/staychatbot_processing");
  } catch (error) {
    console.error("Error processing introduction:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});
*/
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
router.post("/submit-answer", async (req, res) => {
  const { question, answer, questionId } = req.body;
  console.log("꼬질 질문 이벤트 체크");
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
    {
      role: "system",
      content:
        "You are a helpful interview question generator that provides follow-up questions and tips based on the applicant's answer.",
    },
    { role: "user", content: prompt_content },
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
    console.log(content);

    const data = JSON.parse(content); // JSON 파싱
    console.log("꼬질 전송 체크" + JSON.stringify(data, null, 2));
    res.json({ data });
    
    // DB저장
    pool.getConnection( async (err, conn) =>{
      if (err){
        console.error("Mysql getConnection error: ", err);
        console.dir()
        res.status(500).send({ success: false, message: "Database connection failed" });
        if (conn) conn.release();
        return;
      }
      console.log('꼬질 이벤트 체크')
      try {
        const gojlieChatInsert = await conn.promise().query(
          "INSERT INTO extended_questions(question_id, tail_question, tail_answer, tail_tip) VALUES (?,?,?,?);",
          [  questionId , data.질문, answer, data.tip]
        )
        console.log('꼬질 쿼리 이벤트 체크')
      } catch (error) {
        console.log('꼬질 쿼리 이벤트 에러' + error)
      }
    });
  } catch (error) {
    console.error("Error processing answer:", error);
    res.status(500).json({ error: "Error processing answer" });
  }
});

// 세션 질문 받는 경로
router.get("/get_questions", (req, res) => {
  if (req.session.results) {
    res.json({ questions: req.session.results.questions }); // JSON 형식으로 질문 데이터 응답
    return;
    //console.log('세션 전달 확인:', JSON.stringify(res.json({ questions: req.session.results.questions }), null, 2))
  } else {
    res.status(404).send({ message: "No questions available" }); // 데이터가 없는 경우 404 응답
  }
});

export default router;
