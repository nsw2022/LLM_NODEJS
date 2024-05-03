
CREATE TABLE chat
(
  chat_id         INT          NULL     AUTO_INCREMENT COMMENT '무결성 참조용 컬럼',
  user_login_id   VARCHAR(100) NULL     COMMENT '사용자 ID 참조',
  introduction    TEXT         NULL     COMMENT '사용자의 처음 질문',
  chat_summary    VARCHAR(200) NULL     COMMENT '채팅방 요약 및 이름',
  chat_created_at TIMESTAMP    NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  job_category    varchar(20)  NULL     COMMENT '직무 유형',
  interview_type  varchar(20)  NULL     COMMENT '기술/인성',
  PRIMARY KEY (chat_id)
) COMMENT '왼쪽 사이드 채팅 바';

CREATE TABLE extended_question
(
  tail_id         INT          NULL     AUTO_INCREMENT COMMENT '무결성 컬럼',
  question_id     INT          NULL     COMMENT 'question 테이블의 question_id 참조',
  tail_question   TEXT         NULL     COMMENT '꼬리 질문 저장',
  tail_answer     TEXT         NULL     COMMENT '꼬리 질문의 대답',
  tail_tip        VARCHAR(200) NULL     COMMENT '꼬리 질문 팁',
  tail_created_at TIMESTAMP    NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  PRIMARY KEY (tail_id)
) COMMENT '꼬리질문 저장';

CREATE TABLE initial_question
(
  question_id         INT          NULL     AUTO_INCREMENT COMMENT '무결성 참조용 컬럼',
  chat_id             INT          NULL     COMMENT 'chat 테이블의 chat_id 참조',
  question_code       int          NULL     COMMENT '질문분류번호 0~5',
  question_text       VARCHAR(200) NULL     COMMENT '대분류 질문 모음',
  question_tip        VARCHAR(200) NULL     COMMENT '대분류 질문 팁 모음',
  question_created_at TIMESTAMP    NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  PRIMARY KEY (question_id)
) COMMENT '대질문 질문 저장';

CREATE TABLE user
(
  user_id         INT          NULL     AUTO_INCREMENT COMMENT '무결성 참조용 컬럼',
  user_login_id   VARCHAR(100) NOT NULL COMMENT '사용자 로그인 아이디',
  user_name       VARCHAR(100) NOT NULL COMMENT '사용자 이름',
  user_email      VARCHAR(100) NOT NULL COMMENT '사용자 이메일',
  user_pass       VARCHAR(300) NOT NULL COMMENT '사용자 비번',
  user_created_at TIMESTAMP    NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성 시각',
  PRIMARY KEY (user_id)
) COMMENT '유저 정보 저장';

ALTER TABLE chat
  ADD CONSTRAINT FK_user_TO_chat
    FOREIGN KEY (user_login_id)
    REFERENCES user (user_login_id);

ALTER TABLE initial_question
  ADD CONSTRAINT FK_chat_TO_initial_question
    FOREIGN KEY (chat_id)
    REFERENCES chat (chat_id);

ALTER TABLE extended_question
  ADD CONSTRAINT FK_initial_question_TO_extended_question
    FOREIGN KEY (question_id)
    REFERENCES initial_question (question_id);

CREATE INDEX idx_question_code
  ON initial_question (question_code ASC);
