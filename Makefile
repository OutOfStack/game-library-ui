.PHONY: run build test updateall

run:
	./env.sh
	bun run dev

build:
	bun install
	bun run build

test:
	bun test

update:
	bun update

updateall:
	bunx npm-check-updates -u --target minor
	bun install
