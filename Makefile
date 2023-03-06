run:
	./env.sh
	mv env-config.js ./build/
	npm start

build:
	npm install
	npm run build

test:
	npm test