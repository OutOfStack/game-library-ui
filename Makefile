.PHONY: run build test

run:
	./env.sh
	npm run dev

build:
	npm install
	npm run build

test:
	npm test
