import mysql from "mysql2";
import express from "express";
import dbconfig from "../config/dbconfig.json" assert { type: "json" };
import sendEmail from "../services/mailTest.js";

const router = express.Router();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbconfig.host,
  user: dbconfig.user,
  password: dbconfig.password,
  database: dbconfig.database,
  debug: false,
});

/* 아이디 중복검사 */
router.post("/process/checkuid", (req, res) => {
  console.log("/process/checkuid 이벤트 체크");
  // 여기서 생성한 랜덤한 값과 이메일에 보낸값이 같고
  // 그러면 승인 이 떨어짐

  /*
        1. id 받아와서 select 검색
        2. 1이상 나오면 res로 fail전송
        3. 0이면 어서와
    */

  const { uid } = req.body;

  pool.getConnection((err, conn) => {
    if (err) {
      if (conn) conn.release();
      console.error("Mysql getConnection error: ", err);
      res
        .status(500)
        .send({ success: false, message: "Database connection failed" });
      return;
    }

    console.log("데이터베이스 연결됨");
    const sql = "SELECT COUNT(*) AS count FROM user WHERE uid = ?";
    conn.query(sql, [uid], (err, results) => {
      conn.release();
      if (err) {
        console.error("SQL 실행 시 오류 발생: ", err);
        res.status(500).send({ success: false, message: "SQL Error" });
        return;
      }

      const count = results[0].count;
      if (count > 0) {
        console.log("중복 아이디 있음");
        res.send({ success: false, message: "이미 사용 중인 아이디입니다." });
      } else {
        console.log("사용 가능한 아이디");
        res.send({ success: true, message: "사용 가능한 아이디입니다." });
      }
    });
  });
});

/* 이메일 검사 */
router.post("/process/approve", async (req, res) => {
  console.log("/process/approve 이벤트 체크");
  // 여기서 생성한 랜덤한 값과 이메일에 보낸값이 같고
  // 그러면 승인 이 떨어짐

  /*
        1. contorller 단에서 랜덤 상수 4자리
        2. 랜덤 수를 json 전송
        3. 예시 res.send({ success: true, message: '환영합니다 로그인 부탁드립니다!', redirectTo: '/join' });
        4. html에서 ajax 로 받고 틀리면 실패 맞으면 성공
        5. 그러면 이메일 바꿀수 없게 설정
    */

  // 1.
  const verificationCode = Math.floor(
    Math.floor(1_000 + Math.random() * 9_000)
  );

  // 이메일 발송 함수 호출
  const to = req.body.email; // 요청에서 이메일 주소를 받음
  try {
    await sendEmail({
      to: to,
      subject: "이메일 인증 코드",
      text: `인증 코드: ${verificationCode}`,
    });
    // 이메일 발송 후 사용자에게 응답 전송
    res.send({
      success: true,
      message: "인증 코드가 발송되었습니다.",
      verificationCode: verificationCode,
    });
  } catch (error) {
    console.error("이메일 발송 에러: ", error);
    res
      .status(500)
      .send({ success: false, message: "이메일 발송에 실패했습니다." });
  }
});

/* 회원 추가 */
router.post("/process/adduser", (req, res) => {
  console.log("/process/adduser");
  const { uid, uname, uemail, upass } = req.body;

  pool.getConnection((err, conn) => {
    if (err) {
      if (conn) conn.release();

      console.log("Mysql getConnection error: " + err);
      return;
    }

    console.log("데이터베이스 연결 잘됨");
    const exec = conn.query(
      "insert into user (uid, uname, uemail, upass) values (?,?,?, SHA2(?,512) );",
      [uid, uname, uemail, upass],
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
          res.send({
            success: true,
            message: "환영합니다 로그인 부탁드립니다!",
            redirectTo: "/join",
          });
        } else {
          console.dir(result);
          console.log("Inserted 실패");
        }
      }
    );
  });
});

router.post("/process/login", (req, res) => {
  const { uid, upass } = req.body;
  pool.getConnection((err, conn) => {
    if (err) {
      console.error("Mysql getConnection error: " + err);
      res.status(500).send({ success: false, message: "데이터베이스 연결 실패" });
      return;
    }
    conn.query("SELECT `uid`, `uname` FROM `user` WHERE `uid` = ? AND `upass` = SHA2(?, 512)", [uid, upass], (err, rows) => {
      conn.release();
      if (err) {
        console.error('SQL 실행 시 오류 발생:', err);
        res.status(500).send({ success: false, message: "로그인 처리 중 오류 발생" });
        return;
      }
      if (rows.length > 0) {
        console.log('아이디 [%s], 이름 [%s]으로 로그인 성공', uid, rows[0].uname);

        // 세션에 정보 저장
        req.session.user = { id: uid, name: rows[0].uname, role: rows[0].role };
        
        res.send({
          success: true,
          message: "환영합니다, " + rows[0].uname + "님!",
          redirectTo: "/one_magnetic"
        });
      } else {
        res.send({ success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." });
      }
    });
  });
});



export default router;
