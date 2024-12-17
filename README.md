## Setup
To get this project up and running on your local machine, follow these steps:

  

### Pre-requisites
- Node.js installed on your machine

- A package manager like npm or yarn

- Python installed on your machine
- Make sure environment variables are properly configured

	 ```bash
	git clone https://github.com/25Kanon/Synapse-Space.git

	cd <repository-name>
	*front-end directory*
 	cd front-synapse_space
 	*backend-end directory*
 	cd front-backend
	```

### Installation

> Front-end

1. **Install dependencies**

	Navigate to the project directory and run:
	```bash
	npm  install
	```
	or if you are using yarn:
	```bash
	yarn install
	```
2. **Start the development server**
	```bash
	npm  start
	```
	or if you are using yarn:
	```bash
	yarn start
	```

> Back-end
1. **Install dependencies**

	Navigate to the project directory and run:
	```bash
	pip install -r requirements.txt
	```
2. **Create and run migrations**
	```bash
	python manage.py makemigrations
	python manage.py migrate
	```
3. **Run and serve**
	```bash
	python manage.py runserver
	```
