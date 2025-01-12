.PHONY: run build installyarn test

run:
	./env.sh
	npm run dev

build:
	npm install
	npm run build

test:
	npm test
