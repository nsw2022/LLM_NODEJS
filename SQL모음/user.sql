USE llmdatabase;


drop table user, chat_list, question, answer;

CREATE TABLE user(
    user_num INT AUTO_INCREMENT PRIMARY KEY COMMENT '무결성 참조용 컬럼',
    user_id VARCHAR(100) NOT NULL COMMENT '사용자 로그인 아이디',
    user_name VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    user_email VARCHAR(100) NOT NULL COMMENT '사용자 이메일',
    user_pass VARCHAR(300) NOT NULL COMMENT '사용자 비번',
	user_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성 시각',
    INDEX (user_id)  -- user_id 컬럼에 인덱스 추가
);

CREATE TABLE chat_list (
    chat_list_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '무결성 참조용 컬럼',
    user_id VARCHAR(100) COMMENT '사용자 ID 참조',
    introduction TEXT COMMENT '사용자의 처음 질문',
    summary_chat VARCHAR(200) COMMENT '채팅방 이름',
    chat_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    FOREIGN KEY (user_id) REFERENCES user(user_id)  -- 외래 키 제약 조건
);

CREATE TABLE question (
    question_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '무결성 참조용 컬럼',
    chat_list_id INT COMMENT 'introduction 테이블의 intro_id 참조',
    question_code int comment '질문분류번호 0~5',
    questions VARCHAR(200) COMMENT '질문 모음',
    question_tip VARCHAR(200) COMMENT '팁 모음',
    question_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    FOREIGN KEY (chat_list_id) REFERENCES chat_list(chat_list_id)
);

CREATE TABLE answer (
    answer_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '무결성 컬럼',
    question_id INT COMMENT 'question 테이블의 question_id 참조',
    answer_step INT COMMENT '답변의 상태 변수 (0, 1, 2만 저장)',
	answer_tip VARCHAR(200) COMMENT '팁 모음',
    answer_save TEXT COMMENT '답변 저장',
    answer_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    FOREIGN KEY (question_id) REFERENCES question(question_id)
);

select * from user;
select * from chat_list;
select * from question;
select * from answer;
select chat_list_id from question where question_id = 26;

insert into user(user_id, user_name, user_email, user_pass) values('tmddn3410','노승우','tmddn3410@naver.com',sha2('!Xptmxm1234',512));

insert into chat_list(user_id, introduction, summary_chat) values('tmddn3410', '
프로젝트를 진행하기에 앞서 기술적인 측면에서 REST API와 대용량 데이터 처리를 키워드로 삼아 서울열린 데이터 광장의 부동산 정보를 활용하였습니다 저희 팀은 이러한 정보를 활용해 네이버 지도 API를 통해 사용자에게 시각화된 형태로 제공하기로 했습니다 이를 통해 사용자들이 지도 위에서 부동산 정보
를 직관적으로 확인하고 탐색할 수 있도록 하였습니다
여러 분업 중 저는 게시판 제작 업무를 담당해 Django의 장점을 활용하여 데이터베이스 모델을 정의하고 그에 맞는 데이터를 저장하고 관리하는 부분을 담당했습니다 Django의 Model을 활용하여 데이터베이스 구조를 빠르게 설계하고 구현함으로써 시간을 절약하고 이를 기반으로 게시판 화면을 구성하였습니다 또한 로그인 여부에 따른 게시판 화면의 차이나 조회 수 및 추천 수에 따른 정렬 등 다양한 기능을 구현하여 사용자들이 더 효율적으로 부동산 정보를 활용할 수 있도록 만들었습니다
이 프로젝트를 통해 긍정적인 결과를 얻을 수 있었습니다 성공적으로 마무리하고 제 기술과 아이디어가 현실적으로 적용되는 것을 보며 뿌듯함을 느꼈습니다 또한 팀원들과의 협업을 통해 효과적인 소통과 역할 분담이 프로젝트의 성공에 어떠한 영향을 미치는지를 몸소 체험하게 되었습니다
팀원들과 원활한 의사소통과 역할 분담은 프로젝트의 진행과 성공에 핵심적인 역할을 한다는 것을 깨닫게 되었습니다 또한 제 기술과 아이디어가 실제로 회사에 기여할 수 있는 가치를 가진다는 확신을 얻게되었습니다 이러한 경험을 토대로 저는 미래에도 협업 능력과 기술적인 역량을 더 키워 귀사에 더욱 큰가치를 제공하고자 합니다
', '프로젝트를 통해 기술력과 협업 능력을 성장시켜 더 큰 가치를 제공하고자 합니다.');

insert into question(chat_list_id,question_code,questions,question_tip) values
(1, 0,"REST API 및 대용량 데이터 처리에 대한 경험을 설명해주세요.", "경험을 구체적으로 서술하고, 프로젝트에서 어떻게 활용했는지 자세히 언급해보세요."),
(1, 1,"Django를 사용하여 데이터베이스 모델을 정의하고 관리한 경험에 대해 이야기해주세요.", "Django를 활용한 구체적인 사례를 들어 설명하고, 데이터 관리 과정에서 겪은 어려움과 해결방법에 대해 언급해보세요."),
(1, 2,"게시판 화면을 구성하는 과정에서 로그인 여부에 따른 차이나 정렬 등의 기능을 구현한 경험을 공유해주세요.", "구현한 기능의 목적과 사용자 경험에 미치는 영향에 대해 설명하고, 기능을 개발하면서 어떤 고려 사항이 있었는지 언급해보세요."),
(1, 3,"프로젝트 팀원들과의 협업 경험 중 가장 도전적이었던 상황을 언급해주세요.", "도전적인 상황에서 어떻게 대처했는지, 문제 해결을 위해 어떤 노력을 기울였는지 구체적으로 설명해보세요."),
(1, 4,"협업 능력을 키우기 위해 어떤 노력을 기울였는지 자세히 설명해주세요.", "협업 능력을 향상시키기 위해 어떤 행동을 취했으며, 그 결과로 얻은 교훈이 무엇이었는지 공유해보세요."),
(1, 5,"미래에 귀사에 기여할 수 있는 가치를 높이기 위해 어떤 기술적인 역량을 키워나갈 계획이 있나요?", "귀사에 기여할 수 있는 방안과 그에 필요한 기술 역량 향상 계획에 대해 구체적으로 언급해보세요.");

insert into answer(question_id, answer_step,answer_tip,answer_save) values
(1, 0,'경험을 구체적으로 서술하고, 프로젝트에서 어떻게 활용했는지 자세히 언급해보세요.',"대용량 데이터를 다루는 REST API를 개발할 때, 데이터베이스 쿼리 성능이 전체 응답 시간에 큰 영향을 미칩니다. 특히 복잡한 조인이나 대량 데이터에 대한 쿼리는 성능 저하의 주요 원인이 될 수 있습니다. 이를 해결하기 위해 다음과 같은 최적화를 진행했습니다

인덱스 추가: 쿼리에 자주 사용되는 칼럼에 인덱스를 추가하여 검색 속도를 개선했습니다.
쿼리 리팩토링: 필요하지 않은 칼럼을 제거하고, 조인 대신 서브쿼리를 사용하는 등 쿼리를 단순화했습니다.
EXPLAIN PLAN 사용: 쿼리의 실행 계획을 분석하여 비효율적인 부분을 찾아 수정했습니다.
결과적으로, API의 평균 응답 시간이 50% 이상 개선되었습니다.");