FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update -y
RUN apt-get install nodejs -y
RUN apt-get install npm -y
RUN apt-get install curl -y
RUN apt-get install git -y
RUN apt-get install zsh -y
RUN apt-get install git-core -y
RUN apt-get install supervisor -y
RUN apt-get install rsync -y

# Install Oh-My-ZSH
RUN CHSH=yes RUNZSH=yes KEEP_ZSHRC=yes sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)" "" --unattended

# Install Node.js v19
RUN npm i -g n
RUN n 19

# Install global NPM dependencies
RUN npm i -g tsx pnpm

WORKDIR /container
COPY .docker/dev .
RUN pnpm install

COPY .docker/dev/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY .docker/dev/ready.js /bin/ready
RUN chmod +x /bin/ready

RUN mkdir -p /code
WORKDIR /code

ENV FORCE_COLOR=1

CMD [ "/usr/bin/supervisord" ]