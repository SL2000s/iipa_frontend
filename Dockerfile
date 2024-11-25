FROM node:20

WORKDIR /iipa_frontend

COPY . /iipa_frontend

RUN npm install

EXPOSE 3000

CMD ["npm", "start"] 

