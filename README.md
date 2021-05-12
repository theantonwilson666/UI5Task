# Настройка рабочей области

1. В рабочей области делаем клоны репозиторий: 

    `git clone https://github.com/theantonwilson666/UI5Task.git`
    
    `git clone https://github.com/Elrut/SIBUR_NODE_MODULES`

2. Из папки `SIBUR_NODE_MODULES` перемещаем `node_modules` в папку `UI5Task`

3. Скачиваем UI5 SDK 1.60.29+

    `https://tools.hana.ondemand.com/#sapui5`
    
4. Создаем папку `sapui5-dist-static` в папке `UI5Task` и распаковываем туда содержимое SDK.

5. В консоле прописываем
    
    `npm init`
    
    `npm install`
    
    `npm i grunt-contrib-connect`
    
    `npm i grunt-openui5`

# Запуск локального сервера

Локальный сервер уже настроен на работу с системой TMD. Необходимо только запустить его локально командой `grunt serve`. 

Ссылка на ланчпад(точка входа в приложение) `http://localhost:8000/ui/fiorisandbox/` или же напрямую `http://localhost:8000/ui/ui5_example/webapp`


Все необходимые настройки можно делать в файле `Gruntfile.js`, там же задаются запросы на перенос в систему.


# Работа с GIT ветками

1. Создаем `свою ветку` от `main` ввида `LastName_N`, где N - 1..999999.
Работаем в ней.

2. Делаем `commit + push` изменений в свою ветку.

3. После выполнения задачи, пишем старшему разрабу на проверку.
