#include <map>
#include <vector>
class Connect;
class EventLoop;
class Socket;
class Acceptor;
class Thread;
#pragma once
class Server
{
public:
    Server(EventLoop *loop);
    ~Server();
    void Connection(Socket *socket);
    void DeleteConnect(int socketfd);

private:
    EventLoop *mainReactor;
    std::vector<EventLoop *> subReactor;
    Acceptor *acceptor;
    std::map<int, Connect *> connections;
    Thread *thread;
};