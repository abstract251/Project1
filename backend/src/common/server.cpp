#include "event_loop.h"
#include "server.h"
#include "socket.h"
#include "channel.h"
#include "acceptor.h"
#include "connect.h"
#include <functional>
#include <iostream>
Server::Server(EventLoop *loop)
{
    e = loop;
    acceptor = new Acceptor(loop);
    std::function<void(Socket *)> lambda = [this](Socket *socket)
    { this->Connection(socket); };
    acceptor->SetCallBack(lambda);
}
Server::~Server()
{
    delete e;
    delete acceptor;
}
void Server::Connection(Socket *socket)
{
    Connect *connect = new Connect(socket, e);
    auto fd = connect->Get();
    std::function<void()> lambda = [this, fd]()
    { this->DeleteConnect(fd); };
    connect->SetCallBack(lambda);
    connections[fd] = connect;
}

void Server::DeleteConnect(int socketfd)
{
    auto it = connections.find(socketfd);
    if (it != connections.end())
    {
        Connect *conn = it->second;
        connections.erase(it);
        delete conn;
    }
    else
    {
        std::cout << "Server：" << socketfd << "，该socketfd值不存在，无法删除" << std::endl;
    }
}