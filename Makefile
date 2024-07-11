run:
	./env.sh
	mv env-config.js ./build/
	npm start

build:
	npm install
	npm run build

intallyarn:
	npm install -g yarn

test:
	npm test