run:
	./env.sh
	mv env-config.js ./build/
	npm start

build:
	npm install
	npm run build

installyarn:
	npm install -g yarn

test:
	npm test
