.PHONY: run build test updateall

run:
	./env.sh
	npm run dev

build:
	npm install
	npm run build

test:
	npm test

updateall:
	npx npm-check-updates -u
	npm install