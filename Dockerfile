FROM node:20

WORKDIR /iipa_frontend

COPY . /iipa_frontend

RUN npm install
RUN npm run build
RUN npm install -g serve

EXPOSE 3000

# CMD ["npm", "start"] 
CMD ["serve", "-s", "build"] 
