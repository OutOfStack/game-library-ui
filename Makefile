.PHONY: run build test outdated update updateall

run:
	./env.sh
	bun run dev

build:
	bun install
	bun run build

test:
	bun run test

outdated:
	bun outdated

update:
	bun update

updateall:
	bunx npm-check-updates -u --target minor
	bun install
