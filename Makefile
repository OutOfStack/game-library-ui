run:
	./env.sh
	mv env-config.js ./build/
	npm start

build:
	npm run build

test:
	npm test