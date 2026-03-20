.PHONY: dev build start lint format docker-up docker-down docker-db docker-build docker-logs clean

# --- Development ---

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

format:
	npm run format

# --- Docker ---

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-db:
	docker compose up db -d

docker-build:
	docker compose up -d --build

docker-logs:
	docker compose logs -f

# --- Cleanup ---

clean:
	rm -rf .next node_modules
