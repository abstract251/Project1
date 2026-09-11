#include <map>
class Connect;
class EventLoop;
class Socket;
class Acceptor;
#pragma once
class Server
{
public:
    Server(EventLoop *loop);
    ~Server();
    void Connection(Socket *socket);
    void DeleteConnect(int socketfd);

private:
    EventLoop *e;
    Acceptor *acceptor;
    std::map<int, Connect *> connections;
};