
FROM debian

RUN set -ex \
    && apt-get update -qq \
    && apt-get install -qy \
    # apt-key dependencies
    curl \
    gnupg2 \
    # Node.js dependencies \
    ca-certificates \
    git-core \
    python3-minimal \
    # This is so we can pin to Node versions https://github.com/nodesource/distributions/issues/33
    # See https://deb.nodesource.com/node_12.x/pool/main/n/nodejs/ for list of packages
    && curl -o nodejs.deb https://deb.nodesource.com/node_12.x/pool/main/n/nodejs/nodejs_12.20.0-deb-1nodesource1_amd64.deb \
    && dpkg -i ./nodejs.deb \
    && rm nodejs.deb \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update -qq \
    && apt-get install -qy yarn=1.22.* \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app
WORKDIR /app

# Node
COPY package.json yarn.lock /app/
RUN yarn install --pure-lockfile && yarn cache clean

ENV PATH="/app/bin:/app/node_modules/.bin:${PATH}"

COPY . /app

# Build production CSS and JS
RUN yarn run build
