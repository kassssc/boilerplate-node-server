#----------------------------------------------------------
# BASE
#----------------------------------------------------------
FROM node:16-alpine AS base
WORKDIR /usr/server/

#----------------------------------------------------------
# BUILD
# This build creates a staging docker image 
#----------------------------------------------------------
FROM base AS build
COPY package.json ./
RUN yarn install --silent
COPY ./src ./src
COPY .eslintrc ./
COPY tsconfig.json ./
RUN yarn build
RUN yarn install --production --prefer-offline

#----------------------------------------------------------
# RELEASE
# This build takes the production build from staging build
#----------------------------------------------------------
FROM base AS release
ENV NODE_ENV production
COPY package.json ./
COPY --from=build /usr/server/node_modules ./node_modules
COPY --from=build /usr/server/dist ./dist
CMD yarn start