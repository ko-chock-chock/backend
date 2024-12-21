# Node.js 경량 Alpine 버전 사용
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json 복사
COPY package*.json ./

RUN npm install

# 소스 코드 복사
COPY . .

# NestJS 애플리케이션 빌드 (소스 코드 -> dist 폴더)
RUN npm run build

# 컨테이너에 환경변수 포트 노출
EXPOSE 8080

# 애플리케이션 실행
CMD ["npm", "run", "start"]
