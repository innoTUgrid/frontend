FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . ./
RUN npm run build

FROM nginx:1.25

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY entrypoint.sh .
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/frontend .


# Add API_URL environment variable
ENV API_URL=http://localhost:3000

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]