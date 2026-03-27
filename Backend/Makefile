.PHONY: install build test

install:
	pip install -r requirements-ci.txt

build: install

test: build
	python -m pytest tests/ unitTest/ test_auth.py -v
