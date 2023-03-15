import socket
import threading
import json
import sqlite3

HOST = ''
PORT = 8000

jsonReply = """HTTP/1.1 200 OK
Content-Length: {}
Content-Type: "application/json"

"""

header = """HTTP/1.1 200 OK
Content-Length: {}

""" 

def initDB():  # create database
    connection = sqlite3.connect('db.db')
    curr = connection.cursor()
    curr.execute('CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY, word TEXT)')
    connection.commit()
    curr.execute('CREATE TABLE IF NOT EXISTS subtitles (id INTEGER PRIMARY KEY, text TEXT, lang TEXT, startTime TEXT, videoName TEXT)')
    connection.commit()
    return connection

def addSubtitles(conn, text, lang, startTime, videoName): # add subtitles to database
    curr = conn.cursor()
    curr.execute('INSERT INTO subtitles (text, lang, startTime, videoName) VALUES (?, ?, ?, ?)', (text, lang, startTime, videoName))
    conn.commit()
    return curr.lastrowid

def delSubtitles(conn, subtitle_id): # delete subtitles from database
    curr = conn.cursor()
    deleteStr = "DELETE FROM subtitles WHERE id = {}"
    deleteStr = deleteStr.format(subtitle_id)
    curr.execute(deleteStr)
    conn.commit()

def getSubtitles(conn): # get subtitles from database
    curr = conn.cursor()
    results = curr.execute('SELECT * FROM subtitles')

    items = []
    for row in results:
            items.append({'id' : row[0], 'text': row[1], 'lang': row[2], 'startTime': row[3], 'videoName': row[4]})
    
    return json.dumps(items)    

def addWords(conn, word): # add words to database
    curr = conn.cursor()
    curr.execute('INSERT INTO words (word) VALUES (?)', (word,))
    conn.commit()
    return curr.lastrowid

def delWords(conn, word_id): # delete words from database
    curr = conn.cursor()
    deleteStr = "DELETE FROM words WHERE id = {}"
    deleteStr = deleteStr.format(word_id)
    curr.execute(deleteStr)
    conn.commit()

def getWords(conn): # get tweets from database
    curr = conn.cursor()
    results = curr.execute('SELECT * FROM words')

    items = []
    for row in results:
            items.append({'id' : row[0], 'word': row[1]})
    print(items)
    return json.dumps(items)

def httpReply(client:socket.socket): # reply to http request
    with client:
        inputData = client.recv(1024).decode('utf-8')
        data = inputData.split(" ")
        parseHeader(client, data[0], data[1], inputData)

def parseHeader(client, type, path, data):
    print(data)
    if type == "GET": # GET request handler 

        if path == "/api/words": # get words from database and send to client 
            connection = initDB()
            sendBody = getWords(connection)
            thisHeader = jsonReply.format(len(sendBody))
            msg = thisHeader + sendBody
            client.sendall(msg.encode())

        elif path == "/api/subtitles": # get subtitles from database and send to client
            connection = initDB()
            sendBody = getSubtitles(connection)
            thisHeader = jsonReply.format(len(sendBody))
            msg = thisHeader + sendBody
            client.sendall(msg.encode())

        elif path == "/": # send index.html to client 
            with open('index.html', encoding="utf-8") as file:
                body = file.read()
            thisHeader = header.format(len(body))
            msg = thisHeader + body
            client.sendall(msg.encode())

        else: # send file to client 
            try:
                with open(path[1:], 'rb') as file:
                    body = file.read()
                byteHeader = header.format(len(body))
                byteHeader = bytes(byteHeader, 'utf-8')
                msg = byteHeader + body
                client.sendall(msg)
            except FileNotFoundError as e:
                client.sendall("HTTP/1.1 404 Not Found".encode())



    elif type == "POST": # POST request handler 

        if path == "/api/words": # add words to database
            connection = initDB()
            splitter = data.split("\r\n\r\n")
            jsonObj = json.loads(splitter[1])
            words = jsonObj['words']
            wordsID = addWords(connection, words)
            thisBody = "added words with id:" + str(wordsID)
            thisHeader = header.format(len(thisBody))
            msg = thisHeader + thisBody
            client.sendall(msg.encode())

        else:
            client.sendall("HTTP/1.1 400 Bad Request".encode())

    elif type == "DELETE": # DELETE request handler

        if "/api/words" in path: # delete words from database
            connection = initDB()
            splitter = path.split("/")
            delWords(connection, splitter[3])
            thisBody = "deleted words with id: " + splitter[3]
            thisHeader = header.format(len(thisBody))
            msg = thisHeader + thisBody
            client.sendall(msg.encode())  

        else:
            client.sendall("HTTP/1.1 400 Bad Request".encode())

    else:
        client.sendall("HTTP/1.1 400 Bad Request".encode())  

initDB()

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        s.bind((HOST, PORT))
        s.listen() 
        while True:
            conn, addr = s.accept()
            print("Connected by", addr)
            newThread = threading.Thread(target=httpReply, args=(conn,))
            newThread.start()


    except KeyboardInterrupt as e:
        print(e)
        s.close()