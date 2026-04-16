.PHONY: install build test

install:
	pip install -r requirements-ci.txt

build: install
	@echo "Build successful"

test: build
	python -m pytest tests/ unitTest/ test_auth.py -v
