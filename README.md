# dog-walks
A demo that uses python and pandas to parse dog walks from GPS data and renders summary information in a react frontend.

## Prerequisites

- Python 3.6+ `brew install python3`
- Pipenv `pip3 install pipenv`
- Node.js `brew install node`

## Installation

Install the parser's dependencies:

```bash
pipenv install
```

Install the frontend's dependencies:

```bash
npm install --prefix ./walks
```

## Run the demo:

Parse the GPS data and show walk summaries with:

```bash
npm start
```
