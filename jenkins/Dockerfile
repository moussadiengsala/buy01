FROM jenkins/jenkins:lts-slim

USER root

# Install essential dependencies including make and required tools for Chrome
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    make \
    wget \
    ca-certificates \
    apt-transport-https \
    software-properties-common \
    libxss1 \
    libappindicator1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm-dev \
    libxshmfence-dev \
    fonts-liberation \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install Docker CLI
RUN curl -fsSL https://get.docker.com | sh

# Install Docker Compose
RUN curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose

# Install Maven
RUN apt-get update && apt-get install -y maven

# Install Node.js and npm (NodeSource)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs


# Install Angular CLI globally
RUN npm install -g @angular/cli


#RUN apt-get update && apt-get install -y \
#    chromium \
#    && ln -s /usr/bin/chromium /usr/bin/google-chrome

ENV CHROME_BIN=/usr/bin/google-chrome

# Install Chrome for Karma tests
RUN apt-get update && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Verify Chrome installation
RUN ls -la /usr/bin/google-chrome* && \
    /usr/bin/google-chrome --version

ENV CHROME_BIN=/usr/bin/google-chrome

# Define build argument for Docker group ID
ARG DOCKER_GROUP_ID=999

# Create docker group with the specified GID and add jenkins user to it
RUN groupadd -g ${DOCKER_GROUP_ID} docker || groupmod -g ${DOCKER_GROUP_ID} docker
RUN usermod -aG docker jenkins

# Switch back to Jenkins user
USER jenkins

EXPOSE 8080 50000

ENV JENKINS_HOME /var/jenkins_home
